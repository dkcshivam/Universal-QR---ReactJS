import axios from 'axios';
import React, { useRef, useState } from 'react'
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const ProductImageUpload = ({ onUpload, images, isUploading }) => {

    const fileInputRef = useRef();

    const [isDragging, setIsDragging] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState(null);

    const handleClick = () => {
        fileInputRef.current.click();
    }

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onUpload(e.dataTransfer.files)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    }

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files);
        }
    }

    const handleImageClick = (img) => {
        setEnlargedImage(img.image || (typeof img === "string" ? img : URL.createObjectURL(img)));
    }

    return (
        <div className="w-full flex flex-col items-center sm:flex-row sm:items-start">

            {/* Upload Box at left */}
            <div
                className={`border-2 border-dashed flex flex-col items-center justify-center
                h-28 w-28 sm:h-48 sm:w-48 text-center px-2 py-4 sm:px-4 sm:py-6 cursor-pointer
                transition-all duration-300 bg-blue-50 hover:bg-blue-100
                ${isDragging ? "border-blue-500 bg-blue-100 scale-105" : "border-blue-300"}
            `}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{ position: "relative" }}
            >
                {isUploading && (
                    <div className='absolute inset-0 bg-white/70 flex items-center justify-center z-10'>
                        <div className='w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
                    </div>
                )}
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleChange}
                    accept="image/*"
                />
                <FaPlus className={`mb-2 ${isDragging ? "text-blue-500 text-4xl" : "text-blue-400 text-3xl"}`} />
                <span className="font-medium text-gray-600 text-sm hidden sm:inline-block">
                    Click or drag and drop to upload
                </span>
                <span className='font-medium text-gray-600 text-sm sm:hidden inline-block'>
                    Click to Upload
                </span>
            </div>

            {/* Images grid */}

            {images && images.length > 0 && (
                <div className="w-full mt-6 grid grid-cols-3 gap-4 sm:mt-0 sm:ml-4 sm:grid-cols-1 sm:flex sm:flex-wrap">
                    {images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img.image || (typeof img === "string" ? img : URL.createObjectURL(img))}
                            alt={`Product ${idx + 1}`}
                            className="h-28 w-28 sm:h-48 sm:w-48 object-cover border border-blue-100 cursor-pointer transition-colors duration-200 hover:border-blue-500"
                            onClick={() => handleImageClick(img)}
                        />
                    ))}
                </div>
            )}

            {/* enlarged image */}

            {enlargedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="absolute inset-0" onClick={() => setEnlargedImage(null)}></div>
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

        </div>
    )
}

export default ProductImageUpload
