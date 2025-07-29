import React from "react";

const DeleteImageModal = ({ open, onClose, onConfirm }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 relative w-full max-w-xs sm:max-w-md">
                <h2 className="text-lg font-bold mb-4 text-center">Confirm Delete</h2>
                <p className="mb-6 text-center text-sm">Are you sure you want to delete this image?</p>
                <div className="flex flex-row justify-center gap-3 mt-2">
                    <button
                        className="px-4 py-2 bg-gray-200 cursor-pointer rounded hover:bg-gray-300"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded hover:bg-red-700"
                        onClick={onConfirm}
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteImageModal;