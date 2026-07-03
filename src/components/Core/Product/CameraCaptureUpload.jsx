import React, { useRef } from "react";
import { FaCamera, FaVideo } from "react-icons/fa";

const CameraCaptureUpload = ({ onUpload, isUploading }) => {
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const openPhotoCamera = () => {
    if (!isUploading) {
      photoInputRef.current?.click();
    }
  };

  const openVideoCamera = () => {
    if (!isUploading) {
      videoInputRef.current?.click();
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      e.target.value = null;
    }
  };

  return (
    <>
      {/* Photo */}
      <div
        className="relative border-2 border-dashed border-green-300 bg-green-50 hover:bg-green-100 rounded-md w-28 h-28 sm:w-48 sm:h-48 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
        onClick={openPhotoCamera}
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

        <span className="mt-1 text-[10px] text-gray-500 sm:hidden">
          Photo
        </span>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          disabled={isUploading}
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {/* Video */}
      <div
        className="relative border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 rounded-md w-28 h-28 sm:w-48 sm:h-48 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
        onClick={openVideoCamera}
      >
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-md">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>

            <span className="text-xs mt-2 text-gray-600 font-medium">
              Uploading...
            </span>
          </div>
        )}

        <FaVideo size={32} className="text-purple-600" />

        <span className="mt-2 text-sm font-medium text-gray-700 hidden sm:block">
          Record Video
        </span>

        <span className="mt-1 text-[10px] text-gray-500 sm:hidden">
          Video
        </span>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          disabled={isUploading}
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </>
  );
};

export default CameraCaptureUpload;