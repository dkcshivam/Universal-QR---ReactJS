import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrowserQRCodeReader,
  DecodeHintType,
  BarcodeFormat,
} from "@zxing/library";
import { FiX, FiZap, FiZapOff, FiRotateCw } from "react-icons/fi";

const FullScreenQRScanner = ({ onResult, onClose }) => {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Initialize scanner on mount
  useEffect(() => {
    // Detect if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(
        userAgent
      );
    };
    setIsMobile(checkMobile());

    initializeCodeReader();
    startScanner();

    // Cleanup on unmount
    return () => {
      stopScanning();
    };
  }, []);

  const initializeCodeReader = () => {
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.ALSO_INVERTED, true);
    hints.set(DecodeHintType.PURE_BARCODE, false);
    hints.set(DecodeHintType.CHARACTER_SET, "UTF-8");

    codeReader.current = new BrowserQRCodeReader(300, hints);
    console.log("Full-screen QR scanner initialized");
  };

  const getVideoInputDevices = async () => {
    try {
      if (!codeReader.current) {
        return { devices: [], deviceId: null };
      }

      let devices;
      try {
        devices = await codeReader.current.listVideoInputDevices();
      } catch (enumError) {
        console.warn("Device enumeration failed:", enumError.message);
        return { devices: [], deviceId: null };
      }

      if (devices.length === 0) {
        return { devices: [], deviceId: null };
      }

      // Store all available devices
      setAvailableDevices(devices);

      // Prefer back camera for mobile scanning
      const backCamera = devices.find(
        (device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("environment") ||
          device.label.toLowerCase().includes("rear") ||
          device.label.toLowerCase().includes("camera2") ||
          (device.label === "" && device.deviceId.includes("1"))
      );

      let deviceId = null;
      let deviceIndex = 0;

      if (backCamera) {
        deviceId = backCamera.deviceId;
        deviceIndex = devices.findIndex(
          (d) => d.deviceId === backCamera.deviceId
        );
        console.log(
          "Using back camera:",
          backCamera.label || backCamera.deviceId
        );
      } else if (devices.length > 0) {
        // If no back camera found, use the last device (often the back camera on mobile)
        deviceIndex = devices.length - 1;
        deviceId = devices[deviceIndex].deviceId;
        console.log(
          "Using last available camera:",
          devices[deviceIndex].label || devices[deviceIndex].deviceId
        );
      }

      if (deviceId) {
        setSelectedDeviceId(deviceId);
        setCurrentDeviceIndex(deviceIndex);
      }

      return { devices, deviceId };
    } catch (err) {
      console.error("Error getting video devices:", err);
      return { devices: [], deviceId: null };
    }
  };

  const startScanner = async (deviceId = null) => {
    try {
      setError(null);

      // Request camera permission first
      let stream;
      try {
        const constraints = {
          video: {
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
        };

        // If specific device ID provided, use it; otherwise prefer back camera
        if (deviceId) {
          constraints.video.deviceId = { exact: deviceId };
        } else {
          constraints.video.facingMode = "environment"; // Back camera
        }

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Camera access granted");
        stream.getTracks().forEach((track) => track.stop());
      } catch (permissionErr) {
        console.error("Camera permission denied:", permissionErr);
        setError("Camera permission denied. Please allow camera access.");
        return;
      }

      // Get available devices if not using specific device
      let targetDeviceId = deviceId;
      if (!deviceId) {
        const { devices, deviceId: selectedId } = await getVideoInputDevices();
        targetDeviceId = selectedId;
      }

      // Start scanning
      if (codeReader.current) {
        setIsScanning(true);

        await codeReader.current.decodeFromInputVideoDeviceContinuously(
          targetDeviceId || undefined,
          videoRef.current,
          (result, err) => {
            if (result) {
              console.log("QR Result found:", result.getText());
              onResult(result.getText());
              // Auto-close after successful scan
              handleClose();
            }

            if (err && err.name !== "NotFoundException") {
              // Only log significant errors
              if (
                err.name === "ChecksumException" ||
                err.name === "FormatException"
              ) {
                console.log("Scanning error:", err.name);
              }
            }
          }
        );
      }
    } catch (err) {
      console.error("Scanner error:", err);
      setError(`Scanner error: ${err.message}`);
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      try {
        codeReader.current.reset();
        console.log("Scanner stopped");
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    if (onClose) {
      onClose();
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  const toggleFlash = async () => {
    // Note: Flash control is limited in web browsers
    // This is more of a UI placeholder for future implementation
    setFlashEnabled(!flashEnabled);
    console.log("Flash toggle (limited browser support):", !flashEnabled);
  };

  const rotateCamera = async () => {
    if (availableDevices.length <= 1) {
      console.log("Only one camera available, cannot rotate");
      return;
    }

    // Stop current scanning
    stopScanning();

    // Calculate next device index
    const nextIndex = (currentDeviceIndex + 1) % availableDevices.length;
    const nextDevice = availableDevices[nextIndex];

    console.log(
      "Switching to camera:",
      nextDevice.label || nextDevice.deviceId
    );

    // Update state
    setCurrentDeviceIndex(nextIndex);
    setSelectedDeviceId(nextDevice.deviceId);

    // Restart scanner with new device
    setTimeout(() => {
      startScanner(nextDevice.deviceId);
    }, 100);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Scanner Error</h3>
          <p className="text-sm mb-6">{error}</p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video container - full screen */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {/* Overlay controls */}
        <div className="absolute inset-0">
          {/* Top bar with close button */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex justify-between items-center p-4 pt-8">
              <button
                onClick={handleClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
              >
                <FiX className="w-6 h-6" />
              </button>

              <h1 className="text-white text-lg font-semibold">Scan QR Code</h1>

              <div className="flex items-center space-x-2">
                {/* Camera rotation button - only on mobile devices with multiple cameras */}
                {isMobile && availableDevices.length > 1 && (
                  <button
                    onClick={rotateCamera}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                    title="Switch Camera"
                  >
                    <FiRotateCw className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={toggleFlash}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                  title="Toggle Flash"
                >
                  {flashEnabled ? (
                    <FiZap className="w-5 h-5" />
                  ) : (
                    <FiZapOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Scanning area overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Dark overlay with transparent center */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Scanning frame */}
            <div className="relative z-10">
              <div className="w-64 h-64 border-2 border-white rounded-2xl relative bg-transparent">
                {/* Corner brackets */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg"></div>

                {/* Animated scanning line */}
                {isScanning && (
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="w-full h-0.5 bg-white animate-pulse absolute top-1/2 left-0 transform -translate-y-1/2"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom instruction text */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent">
            <div className="text-center p-8 pb-12">
              <p className="text-white text-lg font-medium mb-2">
                Position QR code within the frame
              </p>
              <p className="text-white/80 text-sm">
                {isScanning ? "Scanning..." : "Initializing camera..."}
              </p>

              {selectedDeviceId && (
                <div className="text-white/60 text-xs mt-2 space-y-1">
                  <p>Camera: {selectedDeviceId.substring(0, 10)}...</p>
                  {isMobile && availableDevices.length > 1 && (
                    <p>
                      {currentDeviceIndex + 1} of {availableDevices.length}{" "}
                      cameras
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenQRScanner;
