import React, { useEffect, useRef, useState, useCallback } from "react";
import { ready, scan } from "qr-scanner-wechat";
import { useNavigate } from "react-router-dom";

const QRScanner = ({ onResult }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [engineReady, setEngineReady] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("live"); // "live" | "native"
  const [decoding, setDecoding] = useState(false);
  const [flashMsg, setFlashMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    ready()
      .then(() => {
        if (isMounted) setEngineReady(true);
      })
      .catch((err) => {
        console.error("OpenCV init error:", err);
        if (isMounted) setError("Failed to load vision engine.");
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // ─── STOP CAMERA STREAM ───────────────────────────────────────────────────
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // ─── STEP 2: LIVE SCANNER — recursive setTimeout (not setInterval) ────────
  useEffect(() => {
    if (!engineReady || mode !== "live") return;

    let isActive = true;
    let timeoutId = null;
    let ctx = null; // reuse context across ticks

    const tick = async () => {
      if (!isActive) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (
        !video ||
        !canvas ||
        video.paused ||
        video.ended ||
        !video.videoWidth
      ) {
        timeoutId = setTimeout(tick, 200);
        return;
      }

      // Sync canvas size only when dimensions change
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx = canvas.getContext("2d", { willReadFrequently: true });
      }
      if (!ctx) ctx = canvas.getContext("2d", { willReadFrequently: true });

      ctx.drawImage(video, 0, 0);

      try {
        const match = await scan(canvas);
        // text is "" (empty string) when nothing found — NOT null
        if (match?.text && isActive) {
          isActive = false;
          stopStream();
          if (onResult) onResult(match.text);
          return;
        }
      } catch (e) {
        // Frame had no detectable code — continue scanning
      }

      // Schedule next tick AFTER current scan completes (prevents overlap)
      timeoutId = setTimeout(tick, 120);
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isActive) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for video to actually have dimensions before scanning
          videoRef.current.onloadedmetadata = () => {
            timeoutId = setTimeout(tick, 600); // 600ms head start for autofocus
          };
        }
      } catch {
        setError("Camera permission denied or unavailable.");
      }
    };

    startCamera();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      stopStream();
    };
  }, [engineReady, mode, stopStream, onResult]);

  // ─── NATIVE PHOTO MODE — for very low-end or stubborn QRs ────────────────
  const handleNativeCapture = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file || !engineReady) return;

      setDecoding(true);
      setFlashMsg(null);

      try {
        const img = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = ev.target.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Scale down if huge (>2000px) — OpenCV doesn't need full 12MP
        const MAX = 1600;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);

        const match = await scan(canvas);
        if (match?.text) {
          if (onResult) onResult(match.text);
        } else {
          setFlashMsg("QR not detected. Try better lighting or get closer.");
          setTimeout(() => setFlashMsg(null), 4000);
        }
      } catch {
        setFlashMsg("Decoding failed. Please try again.");
        setTimeout(() => setFlashMsg(null), 4000);
      } finally {
        setDecoding(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [engineReady, onResult],
  );

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col text-white select-none">
      {/* Hidden processing canvas — never rendered, used by OpenCV only */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNativeCapture}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-30 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => {
            stopStream();
            navigate("/");
          }}
          className="p-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/10 active:scale-95 transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <span className="font-semibold text-xs tracking-widest uppercase text-neutral-300">
          {mode === "live" ? "Live Scanner" : "Photo Mode"}
        </span>
        {/* Photo mode toggle */}
        <button
          onClick={() => {
            stopStream();
            setMode((m) => (m === "live" ? "native" : "live"));
          }}
          className="p-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/10 active:scale-95 transition-transform"
          title={
            mode === "live" ? "Switch to photo mode" : "Switch to live scanner"
          }
        >
          {mode === "live" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Live video */}
      {mode === "live" && (
        <div className="absolute inset-0 z-10">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            autoPlay
          />
        </div>
      )}

      {/* Center overlay */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 z-20">
        <div className="relative w-64 h-64 mb-8">
          {[
            "top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl",
            "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl",
            "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl",
            "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl",
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute w-8 h-8 border-emerald-500 ${cls}`}
            />
          ))}
          <div className="absolute inset-0 border border-white/10 rounded-2xl" />
          {mode === "live" && engineReady && (
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 animate-pulse shadow-[0_0_10px_#10b981]" />
          )}
          {mode === "native" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="white"
                className="w-20 h-20 opacity-20"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                />
              </svg>
            </div>
          )}
        </div>

        <p className="text-neutral-100 font-semibold text-lg mb-1">
          {!engineReady
            ? "Loading engine..."
            : mode === "live"
              ? "Align QR Code"
              : "Take a photo"}
        </p>
        <p className="text-neutral-400 text-xs text-center leading-relaxed max-w-xs">
          {!engineReady
            ? "Downloading OpenCV neural model (~2.5MB)..."
            : mode === "live"
              ? "Hold steady. Works on stained or tilted codes."
              : "Open camera, tap to focus on the label, then capture."}
        </p>

        {(flashMsg || error) && (
          <div className="mt-5 text-center">
            <p
              className={`px-4 py-3 rounded-xl text-xs font-medium border ${
                error
                  ? "bg-red-500/20 border-red-500/40 text-red-200"
                  : "bg-amber-500/20 border-amber-500/40 text-amber-200"
              }`}
            >
              {error || flashMsg}
            </p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="w-full p-8 flex flex-col items-center gap-3 z-20 bg-gradient-to-t from-black to-transparent">
        {mode === "native" && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={decoding || !engineReady}
            className="w-full max-w-xs bg-white text-black font-bold text-sm py-4 px-6 rounded-2xl shadow-2xl active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {decoding ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Scanning...
              </>
            ) : !engineReady ? (
              "Loading..."
            ) : (
              "Open Camera"
            )}
          </button>
        )}
        <p className="text-neutral-600 text-xs text-center pb-2">
          {mode === "live"
            ? "Having trouble? Tap the camera icon above to switch to photo mode."
            : "Live scanner usually faster — tap the video icon above."}
        </p>
      </div>
    </div>
  );
};

export default QRScanner;
