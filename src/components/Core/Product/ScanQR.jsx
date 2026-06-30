import React, { useEffect, useRef, useState, useCallback } from "react";
import { ready, scan } from "qr-scanner-wechat";
import { useNavigate } from "react-router-dom";

const QRScanner = ({ onResult }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const scanTimeoutRef = useRef(null); // ← NEW: tracks the 5s fallback timer

  const [engineReady, setEngineReady] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("live");
  const [decoding, setDecoding] = useState(false);
  const [flashMsg, setFlashMsg] = useState(null);
  const [showManualInput, setShowManualInput] = useState(false); // ← NEW
  const [manualCode, setManualCode] = useState(""); // ← NEW

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

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (!engineReady || mode !== "live") return;

    scanTimeoutRef.current = setTimeout(() => {
      setShowManualInput(true);
    }, 5000);

    return () => {
      clearTimeout(scanTimeoutRef.current);
    };
  }, [engineReady, mode]);

  useEffect(() => {
    if (!engineReady || mode !== "live") return;

    let isActive = true;
    let timeoutId = null;
    let ctx = null;

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
        if (match?.text && isActive) {
          isActive = false;
          clearTimeout(scanTimeoutRef.current); // ← NEW: cancel fallback on success
          stopStream();
          if (onResult) onResult(match.text);
          return;
        }
      } catch (e) {
        // Frame had no detectable code — continue scanning
      }

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
          videoRef.current.onloadedmetadata = () => {
            timeoutId = setTimeout(tick, 600);
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

  // ─── NEW: handle manual submit ────────────────────────────────────────────
  const handleManualSubmit = useCallback(() => {
    if (manualCode.length !== 9) return;
    clearTimeout(scanTimeoutRef.current);
    stopStream();
    if (onResult) onResult(manualCode.toUpperCase());
  }, [manualCode, stopStream, onResult]);

  const handleManualChange = useCallback((e) => {
    const val = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 9);
    setManualCode(val);
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col text-white select-none">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center z-30">
        <button
          onClick={() => {
            stopStream();
            navigate("/");
          }}
          className="p-3 bg-white/40 backdrop-blur-lg rounded-full border border-white/10 active:scale-95 transition-transform"
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
        <span className="font-semibold text-xs tracking-widest uppercase text-neutral-300 flex-1 text-center pr-10">
          Live Scanner
        </span>
      </div>

      {/* Live video */}
      <div className="absolute inset-0 z-10">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
        />
      </div>

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
          {engineReady && (
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 animate-pulse shadow-[0_0_10px_#10b981]" />
          )}
        </div>

        <p className="text-neutral-100 font-semibold text-lg mb-1">
          {!engineReady ? "Loading engine..." : "Align QR Code"}
        </p>
        <p className="text-neutral-400 text-xs text-center leading-relaxed max-w-xs">
          {!engineReady
            ? "Downloading OpenCV neural model (~2.5MB)..."
            : "Hold steady."}
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

        {/* ── NEW: Manual input fallback ── */}
        {showManualInput && (
          <div className="mt-6 w-full max-w-xs animate-fade-in">
            <p className="text-neutral-400 text-xs text-center mb-3">
              Can't scan? Enter the code manually.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={handleManualChange}
                placeholder="9-character code"
                maxLength={9}
                className="
                  flex-1 px-4 py-3 rounded-xl
                  bg-white/10 border border-white/20
                  text-white placeholder-neutral-500
                  text-sm font-mono tracking-widest uppercase
                  focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                  transition-colors
                "
              />
              {manualCode.length === 9 && (
                <button
                  onClick={handleManualSubmit}
                  className="
                    px-4 py-3 rounded-xl
                    bg-emerald-500 hover:bg-emerald-400
                    text-white text-sm font-semibold
                    active:scale-95 transition-all
                    whitespace-nowrap
                  "
                >
                  Submit
                </button>
              )}
            </div>
            {manualCode.length > 0 && manualCode.length < 9 && (
              <p className="text-neutral-500 text-xs text-center mt-2">
                {9 - manualCode.length} character
                {9 - manualCode.length !== 1 ? "s" : ""} remaining
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
