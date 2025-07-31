import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { FiRefreshCw, FiCamera, FiX } from "react-icons/fi";

const CameraModal = ({ onCapture, onClose }) => {
    const webcamRef = useRef(null);
    const [facingMode, setFacingMode] = useState("environment");

    const isMobile = window.innerWidth < 1024;

    const handleSwitchCamera = () => {
        setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 w-screen h-screen">
            <div className="w-screen h-screen flex flex-col items-center justify-center">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode }}
                    className="w-full h-full object-cover"
                    style={{ borderRadius: "0", maxWidth: "100vw", maxHeight: "100vh" }}
                />
                <div className={`absolute bottom-8 left-0 w-full flex justify-center items-center gap-8 ${isMobile ? "" : "px-8"}`}>
                    {isMobile ? (
                        <>
                            <button
                                onClick={handleSwitchCamera}
                                className="w-14 h-14 bg-blue-500 text-white rounded-full shadow cursor-pointer flex items-center justify-center text-2xl"
                                aria-label="Switch Camera"
                            >
                                <FiRefreshCw />
                            </button>
                            <button
                                onClick={() => {
                                    const imageSrc = webcamRef.current.getScreenshot();
                                    onCapture(imageSrc);
                                    onClose();
                                }}
                                className="w-16 h-16 bg-green-500 text-white rounded-full shadow cursor-pointer flex items-center justify-center text-3xl"
                                aria-label="Capture"
                            >
                                <FiCamera />
                            </button>
                            <button
                                onClick={onClose}
                                className="w-14 h-14 bg-gray-700 text-white rounded-full shadow cursor-pointer flex items-center justify-center text-2xl"
                                aria-label="Cancel"
                            >
                                <FiX />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleSwitchCamera}
                                className="px-6 py-3 bg-blue-500 text-white rounded-full shadow cursor-pointer flex items-center gap-2 text-lg"
                                aria-label="Switch Camera"
                            >
                                <FiRefreshCw />
                                Switch
                            </button>
                            <button
                                onClick={() => {
                                    const imageSrc = webcamRef.current.getScreenshot();
                                    onCapture(imageSrc);
                                    onClose();
                                }}
                                className="px-6 py-3 bg-green-500 text-white rounded-full shadow cursor-pointer flex items-center gap-2 text-lg"
                                aria-label="Capture"
                            >
                                <FiCamera />
                                Capture
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-700 text-white rounded-full shadow cursor-pointer flex items-center gap-2 text-lg"
                                aria-label="Cancel"
                            >
                                <FiX />
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraModal;