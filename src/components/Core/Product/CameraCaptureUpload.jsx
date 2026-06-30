import React, { useRef } from "react";
import { FaCamera } from "react-icons/fa";

const CameraCaptureUpload = ({ onUpload, isUploading }) => {
  const cameraInputRef = useRef(null);

  const handleClick = () => {
    if (!isUploading) {
      cameraInputRef.current?.click();
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);

      e.target.value = null;
    }
  };

  return (
    <div
      className="relative border-2 border-dashed border-green-300  bg-green-50 hover:bg-green-100 rounded-md w-28 h-28 sm:w-48 sm:h-48 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
      onClick={handleClick}
    >
      {isUploading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-md">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>

          <span className="text-xs mt-2 text-gray-600 font-medium">
            Uploading...
          </span>
        </div>
      )}

      <FaCamera size={32} className="text-green-600" />

      <span className="mt-2 text-sm font-medium text-gray-700 hidden sm:block">
        Take Photo
      </span>

      <span className="mt-1 text-[10px] text-gray-500 sm:hidden">Camera</span>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*, video/*"
        capture="environment"
        disabled={isUploading}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};

export default CameraCaptureUpload;
