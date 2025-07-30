import React, { useEffect, useRef, useState } from "react";
import { FaTimes, FaSave, FaBan, FaUpload } from "react-icons/fa";

const EditProductModal = ({
    isOpen,
    onClose,
    editFields,
    setEditFields,
    departments,
    onSave,
    loading,
}) => {
    const fileInputRef = useRef();
    const [isDragging, setIsDragging] = useState(false); // for effect on drag
    const dragCounter = useRef(0);

    // fade-out effect when closing the modal 

    const [isClosing, setIsClosing] = useState(false) ; 

    // smooth close effect 

    useEffect(() => {
        if(!isOpen){
            setIsClosing(false)  
        }
    }, [isOpen])

    const handleClose = () => {
        setIsClosing(true) ; 
        
        setTimeout(() => {
            onClose() ; 
            setIsClosing(false)
        }, 400); // 400ms for transition
    }

    if (!isOpen) return null;

    const handleChange = (e) => {
        setEditFields({ ...editFields, [e.target.name]: e.target.value });
    };

    // Drag & drop handlers for cover image

    const handleDrop = (e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setEditFields({ ...editFields, cover_image: e.dataTransfer.files[0] });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        dragCounter.current += 1;
        setIsDragging(true);
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
                <h2 className="text-xl font-bold mb-5 text-center">
                    Update Product Details
                </h2>

                {/* product detail being updated */}

                {
                    loading && (
                        <div className="flex flex-col items-center mb-4">
                            <span className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-2"></span>
                            <p className="text-blue=500 font-medium text-sm animate-pulse">
                                Your product details are being updated... Please wait. 
                            </p>
                        </div>
                    )
                }

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold mb-1">Product Name</label>
                        <input
                            name="name"
                            value={editFields.name}
                            onChange={handleChange}
                            className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter product name"
                        />
                    </div>

                    {/* Cover image - with preview, drag & drop, and support text */}

                    {/* <div>
                        <label className="block text-xs font-semibold mb-1">Cover Image</label>
                        {editFields.cover_image ? (
                            <div className="relative w-full h-40 flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg overflow-hidden bg-blue-50">
                                <img
                                    src={typeof editFields.cover_image === "string" ? editFields.cover_image : URL.createObjectURL(editFields.cover_image)}
                                    alt="cover preview"
                                    className="object-contain w-full h-full"
                                />
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-100 transition"
                                    onClick={() => setEditFields({ ...editFields, cover_image: null })}
                                    title="Remove image"
                                >
                                    <FaTimes className="text-red-500" />
                                </button>
                            </div>
                        ) : (
                            <div
                                className={`w-full h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition relative
        ${isDragging ? "border-blue-500 bg-blue-100" : "border-blue-300 bg-blue-50 hover:bg-blue-100"}
    `}
                                onClick={() => fileInputRef.current.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                            >
                                <FaUpload className={`text-2xl mb-2 ${isDragging ? "text-blue-500" : "text-blue-400"}`} />
                                <span className={`text-sm ${isDragging ? "text-blue-600 font-semibold" : "text-blue-400"}`}>
                                    {isDragging ? "Drop image here..." : "Click or drag & drop to upload"}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">Supported: JPG, PNG, GIF. Max size 5MB.</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    name="cover_image"
                                    accept="image/*"
                                    onChange={e =>
                                        setEditFields({ ...editFields, cover_image: e.target.files[0] })
                                    }
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div> */}

                    <div>
                        <label className="block text-xs font-semibold mb-1">Cover Image</label>
                        {editFields.cover_image ? (
                            <div className="relative w-full h-40 flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg overflow-hidden bg-blue-50">
                                <img
                                    src={typeof editFields.cover_image === "string" ? editFields.cover_image : URL.createObjectURL(editFields.cover_image)}
                                    alt="cover preview"
                                    className="object-contain w-full h-full"
                                />
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 bg-white rounded-full cursor-pointer p-1 shadow hover:bg-red-100 transition"
                                    onClick={() => setEditFields({ ...editFields, cover_image: null })}
                                    title="Remove image"
                                >
                                    <FaTimes className="text-red-500" />
                                </button>
                            </div>
                        ) : (
                            <div
                                className={`w-full h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition relative
                                    ${isDragging ? "border-blue-500 bg-blue-100" : "border-blue-300 bg-blue-50 hover:bg-blue-100"}
                                `}
                                onClick={() => fileInputRef.current.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                            >
                                <FaUpload className={`text-2xl mb-2 ${isDragging ? "text-blue-500" : "text-blue-400"}`} />
                                <span className={`text-sm ${isDragging ? "text-blue-600 font-semibold" : "text-blue-400"}`}>
                                    {isDragging ? "Drop image here..." : "Click or drag & drop to upload"}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">Supported: JPG, PNG, GIF. Max size 5MB.</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    name="cover_image"
                                    accept="image/*"
                                    onChange={e =>
                                        setEditFields({ ...editFields, cover_image: e.target.files[0] })
                                    }
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1">Department</label>
                        <select
                            name="department"
                            value={editFields.department}
                            onChange={handleChange}
                            className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Select Department</option>
                            {departments.map((dep, idx) => (
                                <option key={dep.key || idx} value={dep.key || ""}>
                                    {dep.label || "Unknown"}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1">Quantity</label>
                        <input
                            name="quantity"
                            type="number"
                            value={editFields.quantity}
                            onChange={handleChange}
                            className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            min={0}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1">Location</label>
                        <input
                            name="location"
                            value={editFields.location}
                            onChange={handleChange}
                            className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter location"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center cursor-pointer gap-2"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        <FaBan /> Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-blue-500 text-white cursor-pointer hover:bg-blue-600 flex items-center gap-2"
                        onClick={onSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span className="saving-animate">Saving...</span>
                            </>
                        ) : (
                            <>
                                <FaSave /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;