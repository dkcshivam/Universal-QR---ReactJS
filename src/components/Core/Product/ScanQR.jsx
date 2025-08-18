import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrowserQRCodeReader,
  DecodeHintType,
  BarcodeFormat,
} from "@zxing/library";
import FullScreenQRScanner from "./FullScreenQRScanner";

const QRScanner = ({ onResult }) => {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null); // null = not asked, true = granted, false = denied
  const [permissionState, setPermissionState] = useState("prompt"); // 'prompt', 'granted', 'denied'
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-start full screen scanner on mobile
  useEffect(() => {
    if (isMobile) {
      setShowFullScreen(true);
    } else {
      checkPermissionStatus();
      initializeCodeReader();
    }
  }, [isMobile]);

  // Desktop scanner logic below
  const initializeCodeReader = () => {
    // Create ZXing code reader with optimized settings for small QR codes with large data
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true); // More thorough scanning for small QR codes
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.ALSO_INVERTED, true); // Scan inverted QR codes too
    hints.set(DecodeHintType.PURE_BARCODE, false); // Allow scanning with background noise

    // For QR codes with large data, we need more comprehensive error correction
    hints.set(DecodeHintType.CHARACTER_SET, "UTF-8"); // Support UTF-8 encoding for larger data

    // Use slower scanning interval (500ms) for more thorough processing of complex QR codes
    codeReader.current = new BrowserQRCodeReader(500, hints);

  };

  const getVideoInputDevices = async () => {
    try {
      if (!codeReader.current) {
        console.error("Code reader not initialized when getting devices");
        return { devices: [], deviceId: null };
      }

      // Try to get devices - on mobile this might fail if permission not granted yet
      let devices;
      try {
        devices = await codeReader.current.listVideoInputDevices();
      } catch (enumError) {
        console.warn(
          "Device enumeration failed (common on mobile before permission):",
          enumError.message
        );
        return { devices: [], deviceId: null };
      }

      if (devices.length === 0) {
        console.warn("No video devices found during enumeration");
        return { devices: [], deviceId: null };
      }

      // Prefer back camera (environment facing) for QR scanning
      const backCamera = devices.find(
        (device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("environment") ||
          device.label.toLowerCase().includes("rear") ||
          device.label.toLowerCase().includes("camera2") || // Android often names back camera as camera2
          (device.label === "" && device.deviceId.includes("1")) // Fallback for unlabeled cameras
      );

      let deviceId = null;
      if (backCamera) {
        deviceId = backCamera.deviceId;
        console.log(
          "Using back camera:",
          backCamera.label || backCamera.deviceId
        );
      } else if (devices.length > 0) {
        // On mobile, try the last device in the list (often the back camera)
        deviceId = devices[devices.length - 1].deviceId;
        console.log(
          "Using last available camera (likely back camera):",
          devices[devices.length - 1].label ||
            devices[devices.length - 1].deviceId
        );
      }

      if (deviceId) {
        setSelectedDeviceId(deviceId);
        console.log("Selected device ID set to:", deviceId);
      } else {
        console.error("No device ID could be determined");
      }

      return { devices, deviceId };
    } catch (err) {
      console.error("Error getting video devices:", err);
      return { devices: [], deviceId: null };
    }
  };

  const checkPermissionStatus = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({
          name: "camera",
        });
        setPermissionState(permission.state);

        if (permission.state === "granted") {
          setHasPermission(true);
          // Don't automatically start - let user click the button
        } else if (permission.state === "denied") {
          setHasPermission(false);
          setError(
            "Camera access denied. Please enable camera permission in your browser settings."
          );
        }

        // Listen for permission changes
        permission.onchange = () => {
          setPermissionState(permission.state);
          if (permission.state === "granted") {
            setHasPermission(true);
            setError(null);
            // Don't automatically start - let user click the button
          } else if (permission.state === "denied") {
            setHasPermission(false);
            setError(
              "Camera access denied. Please enable camera permission in your browser settings."
            );
          }
        };
      }
    } catch (err) {
      console.log(
        "Permission API not supported, will request permission directly"
      );
      setPermissionState("prompt");
    }
  };

  const requestCameraPermission = async () => {
    try {
      setError(null);
      console.log("Requesting camera permission...");

      // Initialize code reader if not already done
      if (!codeReader.current) {
        initializeCodeReader();
      }

      // For mobile devices, we need to request camera permission first
      // before we can enumerate devices
      console.log("Requesting camera access for mobile devices...");

      let stream;
      try {
        // Request camera access with mobile-optimized constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Prefer back camera
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
        });
        console.log("Camera access granted, stream obtained");

        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach((track) => track.stop());
      } catch (permissionErr) {
        console.error("Camera permission denied:", permissionErr);
        throw permissionErr;
      }

      // Now try to get available video devices after permission is granted
      const { devices, deviceId } = await getVideoInputDevices();

      console.log("Device selection result:", {
        devicesCount: devices.length,
        selectedDeviceId: deviceId,
        stateDeviceId: selectedDeviceId,
      });

      if (devices.length === 0) {
        // If device enumeration still fails, try using undefined deviceId (default camera)
        console.warn("No devices enumerated, trying default camera");
        const defaultDeviceId = undefined; // Let ZXing choose default camera

        if (codeReader.current) {
          console.log("Starting QR scanner with default camera");
          setHasPermission(true);
          setPermissionState("granted");
          setIsScanning(true);
          setSelectedDeviceId("default-camera");

          // Start continuous decoding with default camera
          await codeReader.current.decodeFromInputVideoDeviceContinuously(
            defaultDeviceId,
            videoRef.current,
            (result, err) => {
              if (result) {
                console.log("QR Result found:", result.getText());
                console.log("QR Code format:", result.getBarcodeFormat());
                console.log("Result points:", result.getResultPoints());
                console.log(
                  "Data length:",
                  result.getText().length,
                  "characters"
                );
                onResult(result.getText());
              }

              if (err) {
                if (err.name === "ChecksumException") {
                  console.log(
                    "Checksum error - QR detected but data corrupted, hold camera steadier"
                  );
                } else if (err.name === "FormatException") {
                  console.log(
                    "Format error - QR detected but format invalid, ensure good lighting"
                  );
                } else if (err.name !== "NotFoundException") {
                  console.log("Decode error:", err.name);
                }
              }
            }
          );
          return; // Exit early if default camera works
        }
      }

      if (!deviceId) {
        throw new Error(
          "No suitable camera device found after permission granted"
        );
      }

      // Wait a moment for state to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Request permission and start scanning with selected device
      if (codeReader.current && deviceId) {
        console.log("Starting QR scanner with device:", deviceId);
        setHasPermission(true);
        setPermissionState("granted");
        setIsScanning(true);

        // Start continuous decoding - using the correct method name
        await codeReader.current.decodeFromInputVideoDeviceContinuously(
          deviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              console.log("QR Result found:", result.getText());
              console.log("QR Code format:", result.getBarcodeFormat());
              console.log("Result points:", result.getResultPoints());
              console.log(
                "Data length:",
                result.getText().length,
                "characters"
              );
              onResult(result.getText());
              // Continue scanning for more QR codes
            }

            if (err) {
              // Log errors but less frequently to avoid console spam
              if (err.name === "ChecksumException") {
                console.log(
                  "Checksum error - QR detected but data corrupted, hold camera steadier"
                );
              } else if (err.name === "FormatException") {
                console.log(
                  "Format error - QR detected but format invalid, ensure good lighting"
                );
              } else if (err.name !== "NotFoundException") {
                console.log("Decode error:", err.name);
              }
              // NotFoundException is normal when no QR is in view, so we ignore it
            }
          }
        );
      } else {
        throw new Error("Code reader not initialized or no device selected");
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setHasPermission(false);
      setPermissionState("denied");
      setIsScanning(false);

      if (err.name === "NotAllowedError") {
        setError(
          "Camera permission denied. Please allow camera access and try again."
        );
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else if (err.name === "NotSupportedError") {
        setError("Camera is not supported on this device/browser.");
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  };

  const stopScanning = () => {
    console.log("Stopping QR scanner...");
    if (codeReader.current) {
      try {
        codeReader.current.reset();
        console.log("Scanner reset successfully");
      } catch (err) {
        console.error("Error resetting scanner:", err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const handleQRResult = (result) => {
    console.log("QR Code detected:", result);
    // Close the full screen scanner first
    setShowFullScreen(false);

    if (onResult) {
      onResult(result);
    }
    // else {
    //   // Default behavior - show alert and go back
    //   alert(`QR Code detected: ${result}`);
    //   navigate(-1);
    // }
  };

  const handleCloseFullScreen = () => {
    setShowFullScreen(false);
    navigate('/'); // Go back to previous page
    // Don't navigate automatically - let parent handle navigation
  };

  // If mobile, show full screen scanner
  if (isMobile) {
    return showFullScreen ? (
      <FullScreenQRScanner
        onResult={handleQRResult}
        onClose={handleCloseFullScreen}
      />
    ) : null;
  }

  // Permission request UI
  if (hasPermission === null || permissionState === "prompt") {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Camera Access Required
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            To scan QR codes, we need access to your camera. This allows us to
            capture and decode QR codes in real-time.
          </p>
          <button
            onClick={requestCameraPermission}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Enable Camera Access
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Camera Error
          </h3>
          <p className="text-red-700 text-sm mb-6">{error}</p>
          <div className="space-y-2">
            <button
              onClick={requestCameraPermission}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            {permissionState === "denied" && (
              <p className="text-xs text-red-600 mt-2">
                If camera is blocked, please click on the camera icon in your
                browser's address bar and allow access.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main scanner UI
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md">
        <video
          ref={videoRef}
          className="w-full h-auto rounded-xl shadow-lg"
          autoPlay
          playsInline
          muted
        />

        {/* QR Code targeting overlay - Smaller for precise targeting */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 border-2 border-white border-opacity-70 rounded-lg relative">
            {/* Corner brackets for precise targeting */}
            <div className="w-4 h-4 border-l-4 border-t-4 border-white absolute -top-1 -left-1"></div>
            <div className="w-4 h-4 border-r-4 border-t-4 border-white absolute -top-1 -right-1"></div>
            <div className="w-4 h-4 border-l-4 border-b-4 border-white absolute -bottom-1 -left-1"></div>
            <div className="w-4 h-4 border-r-4 border-b-4 border-white absolute -bottom-1 -right-1"></div>

            {/* Center crosshair for precise aiming */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-8 bg-white bg-opacity-50"></div>
              <div className="absolute w-8 h-1 bg-white bg-opacity-50"></div>
            </div>

            {/* Small QR indicator */}
            {/* <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
              Small QR Zone
            </div> */}
          </div>
        </div>

        {hasPermission && !isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-white">Starting scanner...</p>
            </div>
          </div>
        )}

        {hasPermission && isScanning && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs">
            Scanning for QR codes...
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm">Point camera at QR code to scan</p>
        <p className="text-gray-500 text-xs mt-1">
          Optimized for small QR codes (96x96px) with large data • Hold steady
          for best results
        </p>
        <div className="mt-2 text-xs text-blue-600">
          💡 Tips for QR codes with large data: • Ensure excellent lighting •
          Hold device very steady • Keep QR code fully centered • Wait 2-3
          seconds
        </div>

        {/* Debug info */}
        {selectedDeviceId && (
          <div className="mt-2 text-xs text-gray-400">
            Using camera: {selectedDeviceId.substring(0, 8)}...
          </div>
        )}

        {/* Additional debug button for testing */}
        <button
          onClick={() => {
            console.log("Debug - Code reader:", !!codeReader.current);
            console.log("Debug - Selected device:", selectedDeviceId);
            console.log("Debug - Is scanning:", isScanning);
            console.log("Debug - Has permission:", hasPermission);

            // Try to get devices manually
            if (codeReader.current) {
              getVideoInputDevices().then(({ devices, deviceId }) => {
                console.log("Manual device check - devices:", devices);
                console.log(
                  "Manual device check - selected deviceId:",
                  deviceId
                );
              });
            }
          }}
          className="mt-2 px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded"
        >
          Debug Info
        </button>

        {/* Manual retry button if device selection failed */}
        {hasPermission && !selectedDeviceId && (
          <div className="mt-3 space-y-2">
            <button
              onClick={async () => {
                console.log("Manually retrying device selection...");
                const { devices, deviceId } = await getVideoInputDevices();
                if (deviceId) {
                  console.log(
                    "Device selection successful, attempting to start scanner..."
                  );
                  requestCameraPermission();
                } else {
                  setError(
                    "Failed to select camera device. Please check camera permissions."
                  );
                }
              }}
              className="w-full px-3 py-1 text-xs bg-blue-500 text-white rounded"
            >
              Retry Device Selection
            </button>

            {/* Mobile-specific alternative */}
            <button
              onClick={async () => {
                console.log("Trying mobile default camera...");
                try {
                  setIsScanning(true);
                  setSelectedDeviceId("mobile-default");

                  // Try with undefined deviceId (browser's default camera)
                  await codeReader.current.decodeFromInputVideoDeviceContinuously(
                    undefined, // Let browser choose default camera
                    videoRef.current,
                    (result, err) => {
                      if (result) {
                        console.log("QR Result found:", result.getText());
                        onResult(result.getText());
                      }
                      if (err && err.name !== "NotFoundException") {
                        console.log("Decode error:", err.name);
                      }
                    }
                  );
                } catch (err) {
                  console.error("Mobile default camera failed:", err);
                  setError("Mobile camera access failed: " + err.message);
                  setIsScanning(false);
                }
              }}
              className="w-full px-3 py-1 text-xs bg-green-500 text-white rounded"
            >
              Try Mobile Default Camera
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
