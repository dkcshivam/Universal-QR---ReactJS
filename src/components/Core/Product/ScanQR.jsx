import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";

const QRScanner = ({ onResult }) => {
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");

  const handleScan = (detectedCodes) => {
    if (!detectedCodes?.length) return;

    const qrValue = detectedCodes[0].rawValue;

    console.log("QR Detected:", qrValue);

    if (onResult) {
      onResult(qrValue);
    }
  };

  const handleError = (err) => {
    console.error("Scanner Error:", err);
    setError("Camera access denied or unavailable.");
  };

  const switchCamera = () => {
    setFacingMode((prev) =>
      prev === "environment" ? "user" : "environment"
    );
  };

  const closeScanner = () => {
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
        {/* Close Button */}
        <button
          onClick={closeScanner}
          className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
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

        {/* Switch Camera */}
        <button
          onClick={switchCamera}
          className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all"
        >
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
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>

      {/* Scanner */}
      <div className="absolute inset-0 z-10">
        {error ? (
          <div className="flex items-center justify-center h-full text-white p-4 text-center">
            <p className="bg-red-500/80 p-4 rounded-lg">{error}</p>
          </div>
        ) : (
          <Scanner
            key={facingMode}
            onScan={handleScan}
            onError={handleError}
            constraints={{
              facingMode,
            }}
            formats={["qr_code"]}
            components={{
              finder: true,
              torch: true,
            }}
            styles={{
              container: {
                width: "100%",
                height: "100%",
              },
              video: {
                width: "100%",
                height: "100%",
                objectFit: "cover",
              },
            }}
          />
        )}
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-10 left-0 right-0 z-20 text-center pointer-events-none">
        <p className="text-white/80 text-sm bg-black/30 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
          Align QR code to scan
        </p>
      </div>
    </div>
  );
};

export default QRScanner;