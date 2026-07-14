import axios from "axios";
import React, { useRef, useState } from "react";
import { FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { useParams } from "react-router-dom";
import DeleteImageModal from "./DeleteConfirmation";
import { toast } from "react-toastify";
import CameraCaptureUpload from "./CameraCaptureUpload";
import ImageEditorModal from "@/components/image-editor/ImageEditorModal";

const ProductImageUpload = ({
  has_update_power,
  onUpload,
  getImages,
  images,
  isUploading,
  uploadProgress,
}) => {
  const fileInputRef = useRef();
  const { code } = useParams();

  const [isDragging, setIsDragging] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState(null);

  const [editingImage, setEditingImage] = useState(null); // { id, url, name }
  const [isEditorOpen, setIsEditorOpen] = useState(false);

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
      e.target.value = null;
    }
  };

  const handleImageClick = (img) => {
    setEnlargedImage(
      img.image || (typeof img === "string" ? img : URL.createObjectURL(img)),
    );
  };

  const handleDeleteClick = (imageId) => {
    setDeleteImageId(imageId);
    setDeleteModalOpen(true);
  };

  const closeModal = () => {
    setEnlargedImage(null);
  };

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
        },
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

  const handleEditClick = (img) => {
    setEditingImage({
      id: img.id,
      kind: "url",
      url: img.image, // the Django-served image URL
      name: img.image?.split("/").pop() || "image.png",
    });
    setIsEditorOpen(true);
  };

  const handleEditorSave = async (editResult) => {
    if (!editingImage) return;

    // editResult is { blob, file, dataUrl, width, height } — the modal
    // already built a File for us, so no fetch()/blob conversion needed.
    const file = new File([editResult.blob], editingImage.name, {
      type: "image/png",
    });

    // Use the existing onUpload prop to upload the edited file
    // This keeps the same upload pipeline (presigned URL / multipart etc.)
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    onUpload(dataTransfer.files);

    setIsEditorOpen(false);
    setEditingImage(null);
  };

  return (
    <>
      <div className="w-full">
        <div className="flex flex-wrap gap-4 items-start">
          {/* Upload Box */}
          {has_update_power && (
            <div
              className={`relative border-2 border-dashed
          flex flex-col items-center justify-center text-center
          w-28 h-28 sm:w-48 sm:h-48
          p-2 sm:p-4
          cursor-pointer transition-all duration-300
          bg-blue-50 hover:bg-blue-100 rounded-md
          ${
            isDragging
              ? "border-blue-500 bg-blue-100 scale-105"
              : "border-blue-300"
          }`}
              onClick={!isUploading ? handleClick : undefined}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span>
                    {uploadProgress.total > 1
                      ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...`
                      : "Uploading..."}
                  </span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                disabled={isUploading}
                style={{ display: "none" }}
                onChange={handleChange}
                accept="image/*"
              />

              <div className="flex flex-col items-center justify-center h-full w-full gap-1 sm:gap-2">
                <FaPlus
                  className={`${
                    isDragging
                      ? "text-blue-500 text-xl sm:text-3xl"
                      : "text-blue-400 text-lg sm:text-2xl"
                  }`}
                />

                <span className="hidden sm:block text-sm text-gray-600 font-medium text-center">
                  Click or drag and drop to upload
                </span>

                <span className="block sm:hidden text-[10px] text-gray-500 text-center">
                  Upload
                </span>
              </div>

              <span className="font-medium text-gray-600 text-sm sm:hidden inline-block">
                Click to Upload
              </span>
            </div>
          )}

          {/* Camera Box */}
          {has_update_power && (
            <CameraCaptureUpload
              onUpload={onUpload}
              isUploading={isUploading}
            />
          )}

          {/* Images */}
          {images?.map((img, idx) => (
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
                className="
              h-28 w-28
              sm:h-48 sm:w-48
              object-cover
              border border-blue-100
              cursor-pointer
              transition-colors duration-200
              hover:border-blue-500
            "
                onClick={() => handleImageClick(img)}
              />

              {/* Desktop: Edit + Delete buttons on hover */}
              {has_update_power && (
                <div className="hidden sm:flex absolute top-2 right-2 flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {/* Edit button */}
                  <button
                    className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow text-blue-600 cursor-pointer hover:bg-blue-600 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(img);
                    }}
                  >
                    <FiEdit2 />
                    <span className="text-xs font-semibold">Edit</span>
                  </button>
                  {/* Delete button */}
                  <button
                    className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow text-red-600 cursor-pointer hover:bg-red-600 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(img.id);
                    }}
                  >
                    <FaTrash />
                    <span className="text-xs font-semibold">Delete</span>
                  </button>
                </div>
              )}

              {has_update_power && (
                <div className="mt-2 flex sm:hidden gap-2">
                  <button
                    className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(img);
                    }}
                  >
                    <FiEdit2 />
                    <span className="text-xs font-semibold">Edit</span>
                  </button>
                  <button
                    className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(img.id);
                    }}
                  >
                    <FaTrash />
                    <span className="text-xs font-semibold">Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Delete confirmation modal pop-up */}

        <DeleteImageModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      </div>
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closeModal}
        >
          <div className="relative p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg cursor-pointer"
            >
              <FaTimes />
            </button>

            <img
              src={enlargedImage}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded"
            />
          </div>
        </div>
      )}

      {/* ── NEW: Image Editor Modal ── */}
      {isEditorOpen && editingImage && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingImage(null);
          }}
          image={editingImage}
          onSave={handleEditorSave}
        />
      )}
    </>
  );
};

export default ProductImageUpload;
