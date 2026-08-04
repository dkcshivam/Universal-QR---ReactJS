"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, SwitchCamera, Zap, ZapOff } from "lucide-react";

/**
 * In-page camera, replacing `<input type="file" capture="environment">`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 * `capture="environment"` hands the job to the phone's *separate camera app*.
 * That has two costs a low-end phone cannot absorb:
 *
 *   1. Android must background the browser and evict memory to make room for
 *      the camera app. On a 2 GB device with a heavy page resident, that is
 *      where "unable to complete operation due to low memory" comes from — the
 *      failure lands at the app switch, before any of our code runs again.
 *   2. The camera app captures at full sensor resolution. A 12 MP JPEG costs
 *      ~48 MB to decode, and the app then has to shrink it back down anyway.
 *
 * Streaming the camera into the page with getUserMedia avoids both: the
 * browser never leaves the foreground, and the frame is grabbed at a
 * constrained resolution, so a multi-megapixel image is never created at all.
 * This is how in-app cameras on the web normally work.
 *
 * Falls back to the native file input (via `onFallback`) whenever the stream
 * can't be opened — no HTTPS, permission denied, no camera, or a browser
 * without getUserMedia. Capture must keep working even where this doesn't.
 */

type CameraCaptureProps = {
  open: boolean;
  /** Receives the captured frame, already downscaled and JPEG-encoded. */
  onCapture: (file: File) => void;
  onCancel: () => void;
  /** Called instead of rendering when the stream can't be opened. */
  onFallback: () => void;
  /** Cap for the longest edge of the captured frame, in px. */
  maxEdge?: number;
  quality?: number;
};

/**
 * Long-edge cap for a capture, in px. Matches `downscaleImageFile`'s cap, so
 * a photo costs the same whether it came from here or from the phone's camera
 * app via the fallback.
 *
 * The whole frame is kept (no crop), so a 3:4 frame lands at 1200x1600 —
 * ~1.9 MP, the agreed budget, ~8 MB to decode. For comparison, the allocation
 * that was causing the low-memory kills was ~48 MB.
 */
const DEFAULT_MAX_EDGE = 1600;

export default function CameraCapture({
  open,
  onCapture,
  onCancel,
  onFallback,
  maxEdge = DEFAULT_MAX_EDGE,
  quality = 0.85,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  // Releasing the tracks is not optional housekeeping: a stream left running
  // holds camera buffers and keeps the hardware (and its indicator light) on.
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setReady(false);
    setTorchOn(false);
    setTorchSupported(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        onFallback();
        return;
      }

      // Ask for 4:3 — the shape of the actual sensor, and therefore its full
      // field of view.
      //
      // The previous attempt asked for a portrait 3:4 mode (1920x2560). Phone
      // camera *video* modes are landscape-native — 640x480, 1280x720,
      // 1920x1080 — so a portrait mode generally does not exist and the
      // browser silently substitutes the nearest thing it has, typically
      // 1920x1080. That is both a narrower field of view than the sensor can
      // give (16:9 is a crop of the 4:3 frame) and the wrong shape for a
      // portrait screen.
      //
      // No aspectRatio hint alongside width/height: giving both over-constrains
      // the negotiation, and this pair already expresses 4:3.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facingMode },
            // `ideal`, not `exact`: a phone that can't hit these negotiates
            // something close instead of rejecting outright. This is the knob
            // that bounds the frame instead of taking the sensor's full 12 MP.
            width: { ideal: 1600 },
            height: { ideal: 1200 },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        // Torch is Android-Chrome-only and not in the standard constraint set,
        // so it has to be capability-probed rather than assumed. Factory floors
        // are often poorly lit and the native camera had a flash, so this is a
        // real gap to close rather than a nicety.
        const track = stream.getVideoTracks()[0];
        const capabilities = track?.getCapabilities?.() as
          | (MediaTrackCapabilities & { torch?: boolean })
          | undefined;
        setTorchSupported(Boolean(capabilities?.torch));

        setReady(true);
      } catch (err) {
        console.error("[CameraCapture] getUserMedia failed:", err);
        if (!cancelled) onFallback();
      }
    };

    start();

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facingMode]);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      // `torch` is a non-standard Chrome extension, so it isn't in the DOM
      // typings — hence the cast. Guarded by the capability probe above.
      await track.applyConstraints({
        advanced: [{ torch: next }],
      } as unknown as MediaTrackConstraints);
      setTorchOn(next);
    } catch (err) {
      console.error("[CameraCapture] torch toggle failed:", err);
      setTorchSupported(false);
    }
  }, [torchOn]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !ready || busy) return;

    const frameWidth = video.videoWidth;
    const frameHeight = video.videoHeight;
    if (!frameWidth || !frameHeight) return;

    setBusy(true);

    // The WHOLE frame, uncropped — which is exactly what the `object-contain`
    // preview shows, so what the checker framed is what gets saved.
    //
    // This deliberately does NOT crop to the screen's shape. Filling a tall
    // phone screen edge-to-edge would mean cutting 40-75% off the sides of the
    // frame, which narrows the field of view: reported from the floor as
    // having to back away from the table to fit a whole panel in one shot.
    // Checkers here routinely need the whole panel, so field of view wins over
    // an edge-to-edge viewfinder. See CLAUDE.md (p).
    const scale = Math.min(1, maxEdge / Math.max(frameWidth, frameHeight));
    const targetWidth = Math.max(1, Math.round(frameWidth * scale));
    const targetHeight = Math.max(1, Math.round(frameHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setBusy(false);
      return;
    }

    // JPEG has no alpha; a transparent pixel would encode as black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    canvas.toBlob(
      (blob) => {
        // Free the backing store now rather than leaving it to GC.
        canvas.width = 0;
        canvas.height = 0;
        setBusy(false);

        if (!blob) {
          console.error("[CameraCapture] toBlob returned null");
          return;
        }

        // Stop the camera the moment we have the frame — the editor is about
        // to open and there is no reason to keep hardware buffers alive.
        stopStream();

        onCapture(
          new File([blob], `checkpoint-${Date.now()}.jpg`, {
            type: blob.type || "image/jpeg",
            lastModified: Date.now(),
          }),
        );
      },
      "image/jpeg",
      quality,
    );
  }, [ready, busy, maxEdge, quality, onCapture, stopStream]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      {/* The viewfinder gets the entire screen and the controls float over it,
          rather than each taking a slice of the column. object-contain then
          fits the whole frame into the largest box the screen allows — with a
          4:3 frame on a tall phone that is full width, which is what a phone's
          own camera app shows in its 4:3 mode. */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        autoPlay
        muted
        // Without playsInline, iOS Safari takes the video fullscreen in its
        // own player instead of rendering it in the page.
        playsInline
      />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        </div>
      )}

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <button
          type="button"
          onClick={() => {
            stopStream();
            onCancel();
          }}
          aria-label="Cancel"
          className="rounded-full bg-black/50 p-3 text-white backdrop-blur-sm"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2">
          {torchSupported && (
            <button
              type="button"
              onClick={toggleTorch}
              aria-label={torchOn ? "Turn off flash" : "Turn on flash"}
              className="rounded-full bg-black/50 p-3 text-white backdrop-blur-sm"
            >
              {torchOn ? (
                <Zap className="h-6 w-6" />
              ) : (
                <ZapOff className="h-6 w-6" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              setFacingMode((prev) =>
                prev === "environment" ? "user" : "environment",
              )
            }
            aria-label="Switch camera"
            className="rounded-full bg-black/50 p-3 text-white backdrop-blur-sm"
          >
            <SwitchCamera className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-10">
        <button
          type="button"
          onClick={capture}
          disabled={!ready || busy}
          aria-label="Take photo"
          className={`h-20 w-20 rounded-full border-4 border-white transition ${
            ready && !busy ? "bg-white/30 active:scale-95" : "bg-white/10"
          }`}
        >
          <span className="sr-only">Take photo</span>
        </button>
      </div>
    </div>
  );
}
