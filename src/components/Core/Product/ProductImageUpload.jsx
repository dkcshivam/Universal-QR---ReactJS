import React, { useRef } from 'react'
import { FaPlus } from 'react-icons/fa';

const ProductImageUpload = ({ onUpload, images }) => {

    const fileInputRef = useRef();

    const handleClick = () => {

    }

    const handleDrop = () => {

    }

    const handleChange = () => {

    }

    return (
        <div className='flex gap-4'>

            {/* Upload Box */}

            <div
                className='border-2 border-dashed border-blue-300 rounded-md bg-gray-50 flex flex-col items-center justify-center h-48 w-48 text-center px-4 py-6 text-gray-500 cursor-pointer transition hover:bg-blue-50'
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    type='file'
                    multiple
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleChange}
                    accept='image/*'
                />

                {/* Plus Icon */}

                <FaPlus className='text-blue-400 text-3xl mb-2'/>

                <p className="font-medium text-gray-600 text-sm mb-2">
                    Click or drag and drop
                </p>
                <p className="text-xs text-gray-400">to upload product images</p>
            </div>

            {/* Uploaded Images Preview */}

            <div className="flex gap-2 flex-wrap items-center">
                {images && images.length > 0 ? (
                    images.map((img, idx) => (
                        <img
                            key={idx}
                            src={typeof img === "string" ? img : URL.createObjectURL(img)}
                            alt={`Product ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                        />
                    ))
                ) : (
                    <span className=""></span>
                )}
            </div>

        </div>
    )
}

export default ProductImageUpload
