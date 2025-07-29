import axios from "axios";
import React, { useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useParams } from "react-router-dom";

const ProductImageUpload = ({ has_update_power, onUpload, images }) => {
  const fileInputRef = useRef();

  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Upload Box */}

      {has_update_power && (
        <div
        className={`border-2 border-dashed rounded-md flex flex-col items-center justify-center h-48 w-48 text-center px-4 py-6 cursor-pointer transition-all duration-200
      ${
        isDragging
          ? "border-blue-500 bg-blue-50 scale-105"
          : "border-blue-300 bg-gray-50"
      }
      hover:bg-blue-50`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ position: "relative" }}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleChange}
          accept="image/*"
        />
        <FaPlus
          className={`mb-2 ${
            isDragging ? "text-blue-500 text-4xl" : "text-blue-400 text-3xl"
          }`}
        />
        <span className="font-medium text-gray-600 text-sm">
          Click or drag and drop to upload
        </span>
      </div>
      )}

      {/* Uploaded Images Preview */}

      {images && images.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={
                img.image ||
                (typeof img === "string" ? img : URL.createObjectURL(img))
              }
              alt={`Product ${idx + 1}`}
              className="h-48 w-48 object-cover rounded border border-blue-100"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;
