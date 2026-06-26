import React, { useEffect, useRef, useState, useCallback } from "react";
import { ready, scan } from "qr-scanner-wechat";
import { createWorker } from "tesseract.js";
import { useNavigate } from "react-router-dom";

const QRScanner = ({ onResult }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [engineReady, setEngineReady] = useState(false);
  const [error, setError] = useState(null);
  const [flashMsg, setFlashMsg] = useState(null);
  const [usingOCR, setUsingOCR] = useState(false); // show user we switched mode

  useEffect(() => {
    let isMounted = true;
    ready()
      .then(() => { if (isMounted) setEngineReady(true); })
      .catch((err) => {
        console.error("OpenCV init error:", err);
        if (isMounted) setError("Failed to load vision engine.");
      });
    return () => { isMounted = false; };
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (!engineReady) return;

    let isActive = true;
    let timeoutId = null;
    let ctx = null;
    let ocrWorker = null;
    let qrFailStartTime = null;
    const QR_TIMEOUT_MS = 3000;

    // ── OCR fallback: runs Tesseract on current canvas frame ─────────────────
    const runOCR = async () => {
      if (!isActive) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      setUsingOCR(true);
      setFlashMsg("QR not detected — trying to read text from label...");

      try {
        if (!ocrWorker) {
          ocrWorker = await createWorker("eng", 1, {
            // Only load alphanumeric characters — faster and avoids garbage results
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
          });
        }

        const { data } = await ocrWorker.recognize(canvas);
        const rawText = data.text || "";

        const candidates = rawText
          .replace(/\s+/g, " ")
          .trim()
          .split(/\s+/)
          .map((w) => w.replace(/[^A-Z0-9]/g, ""))
          .filter((w) => w.length >= 9);

        if (candidates.length > 0 && isActive) {
          // Pick the longest candidate — most likely to be the QR code value
          const best = candidates.reduce((a, b) => (a.length >= b.length ? a : b));
          console.log("OCR Result:", best, "| All candidates:", candidates);
          isActive = false;
          stopStream();
          await ocrWorker.terminate();
          if (onResult) onResult(best);
          return;
        }

        // OCR also found nothing — keep trying QR scan
        setFlashMsg("Still trying... Hold the label steady and well-lit.");
        setUsingOCR(false);
        qrFailStartTime = null; // reset timer, try QR again
        timeoutId = setTimeout(tick, 300);
      } catch (e) {
        console.error("OCR error:", e);
        setFlashMsg(null);
        setUsingOCR(false);
        qrFailStartTime = null;
        timeoutId = setTimeout(tick, 300);
      }
    };

    // ── Main scan tick ────────────────────────────────────────────────────────
    const tick = async () => {
      if (!isActive) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.paused || video.ended || !video.videoWidth) {
        timeoutId = setTimeout(tick, 200);
        return;
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx = canvas.getContext("2d", { willReadFrequently: true });
      }
      if (!ctx) ctx = canvas.getContext("2d", { willReadFrequently: true });

      ctx.drawImage(video, 0, 0);

      try {
        const match = await scan(canvas);

        if (match?.text && isActive) {
          // QR succeeded — clean up and return
          isActive = false;
          stopStream();
          if (ocrWorker) await ocrWorker.terminate();
          if (onResult) onResult(match.text);
          return;
        }

        // QR scan returned nothing — track how long we've been failing
        if (!qrFailStartTime) qrFailStartTime = Date.now();

        if (Date.now() - qrFailStartTime >= QR_TIMEOUT_MS) {
          // Timeout hit — switch to OCR fallback
          await runOCR();
          return;
        }
      } catch {
        if (!qrFailStartTime) qrFailStartTime = Date.now();
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

        if (!isActive) { stream.getTracks().forEach((t) => t.stop()); return; }

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
      ocrWorker?.terminate();
    };
  }, [engineReady, stopStream, onResult]);

  return (
    <div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col text-white select-none">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center z-30">
        <button
          onClick={() => { stopStream(); navigate("/"); }}
          className="p-3 bg-white/40 backdrop-blur-lg rounded-full border border-white/10 active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="font-semibold text-xs tracking-widest uppercase text-neutral-300 flex-1 text-center pr-10">
          {usingOCR ? "Reading Text..." : "Live Scanner"}
        </span>
      </div>

      {/* Live video */}
      <div className="absolute inset-0 z-10">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
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
            <div key={i} className={`absolute w-8 h-8 ${usingOCR ? "border-amber-400" : "border-emerald-500"} ${cls}`} />
          ))}
          <div className="absolute inset-0 border border-white/10 rounded-2xl" />
          {engineReady && (
            <div className={`w-full h-[2px] bg-gradient-to-r from-transparent ${usingOCR ? "via-amber-400 shadow-[0_0_10px_#f59e0b]" : "via-emerald-400 shadow-[0_0_10px_#10b981]"} to-transparent absolute top-1/2 animate-pulse`} />
          )}
        </div>

        <p className="text-neutral-100 font-semibold text-lg mb-1">
          {!engineReady ? "Loading engine..." : usingOCR ? "Reading label text" : "Align QR Code"}
        </p>
        <p className="text-neutral-400 text-xs text-center leading-relaxed max-w-xs">
          {!engineReady
            ? "Downloading OpenCV neural model (~2.5MB)..."
            : usingOCR
            ? "QR unreadable — extracting code from printed text on label."
            : "Hold steady. If QR is damaged, text will be read automatically."}
        </p>

        {(flashMsg || error) && (
          <div className="mt-5 text-center">
            <p className={`px-4 py-3 rounded-xl text-xs font-medium border ${
              error
                ? "bg-red-500/20 border-red-500/40 text-red-200"
                : "bg-amber-500/20 border-amber-500/40 text-amber-200"
            }`}>
              {error || flashMsg}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;