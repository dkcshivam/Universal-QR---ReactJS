import axios from "axios";
import React, { useRef, useState } from "react";
import { FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { useParams } from "react-router-dom";
import DeleteImageModal from "./DeleteConfirmation";
import { toast } from "react-toastify";

const ProductImageUpload = ({
  has_update_power,
  onUpload,
  getImages,
  images,
  isUploading,
}) => {
  const fileInputRef = useRef();

  const [isDragging, setIsDragging] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState(null);

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

  const handleImageClick = (img) => {
    setEnlargedImage(
      img.image || (typeof img === "string" ? img : URL.createObjectURL(img))
    );
  };

  const handleDeleteClick = (imageId) => {
    setDeleteImageId(imageId);
    setDeleteModalOpen(true);
  };

  const { code } = useParams(); // product code from params

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/qr/products/${code}/images/${deleteImageId}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toast.success("Image deleted successfully", {
        autoClose: 4000, // 4 seconds
      });

      getImages();
      setDeleteImageId(null);
      setDeleteModalOpen(false);

      // No state update, no reload
    } catch (error) {
      toast.error("Failed to delete image.");
      setDeleteModalOpen(false);
      setDeleteImageId(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center sm:flex-row sm:items-start">
      {/* Upload Box at left */}

      {has_update_power && (
        <div
          className={`border-2 border-dashed flex flex-col items-center justify-center
                h-28 w-28 sm:h-48 sm:w-48 text-center px-2 py-4 sm:px-4 sm:py-6 cursor-pointer
                transition-all duration-300 bg-blue-50 hover:bg-blue-100
                ${
                  isDragging
                    ? "border-blue-500 bg-blue-100 scale-105"
                    : "border-blue-300"
                }
            `}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{ position: "relative" }}
        >
          {isUploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <input
            type="file"
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
          <span className="font-medium text-gray-600 text-sm hidden sm:inline-block">
            Click or drag and drop to upload
          </span>
          <span className="font-medium text-gray-600 text-sm sm:hidden inline-block">
            Click to Upload
          </span>
        </div>
      )}

      {/* Images grid */}

      {images && images.length > 0 && (
        <div className="w-full mt-6 grid grid-cols-3 gap-4 sm:mt-0 sm:ml-4 sm:grid-cols-1 sm:flex sm:flex-wrap">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group flex flex-col items-center"
            >
              <img
                src={
                  img.image ||
                  (typeof img === "string" ? img : URL.createObjectURL(img))
                }
                alt={`Product ${idx + 1}`}
                className="h-28 w-28 sm:h-48 sm:w-48 object-cover border border-blue-100 cursor-pointer transition-colors duration-200 hover:border-blue-500"
                onClick={() => handleImageClick(img)}
              />
              {/* Desktop: absolute button on hover */}
              <button
                className="hidden sm:flex absolute top-2 right-2 items-center gap-1 bg-white px-2 py-1 rounded shadow text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-100 group-hover:scale-105 cursor-pointer hover:bg-red-600 hover:text-white"
                title="Delete Image"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(img.id);
                }}
              >
                <FaTrash />
                <span className="text-xs font-semibold">Delete</span>
              </button>
              {/* Mobile: always visible button below image */}
              <button
                className="mt-2 flex sm:hidden items-center gap-1 bg-white px-2 py-1 rounded shadow text-red-600 transition-all duration-200 scale-100 cursor-pointer hover:bg-red-600 hover:text-white w-full justify-center"
                title="Delete Image"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(img.id);
                }}
              >
                <FaTrash />
                <span className="text-xs font-semibold">Delete</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* enlarged image */}

      {enlargedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div
            className="absolute inset-0"
            onClick={() => setEnlargedImage(null)}
          ></div>
          <div className="relative">
            <img
              src={enlargedImage}
              alt="Enlarged"
              className="max-h-[80vh] max-w-[90vw] object-contain shadow-lg"
            />
            <button
              className="absolute top-2 right-2 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 transition-transform duration-200 hover:scale-110 z-10"
              onClick={() => setEnlargedImage(null)}
              aria-label="Close"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal pop-up */}

      <DeleteImageModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ProductImageUpload;
