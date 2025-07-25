import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiPlus, FiCamera } from "react-icons/fi";

const MobileFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide footer when on scan page (full-screen scanner)
  const isOnScanPage = location.pathname === "/scan";

  const handleAddProduct = () => {
    navigate("/add-product");
  };

  const handleScanQR = () => {
    navigate("/scan");
  };

  // Don't render footer on scan page
  if (isOnScanPage) {
    return null;
  }

  return (
    <>
      {/* Mobile Footer - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around py-3 px-2 gap-4">
          {/* Add Product Button */}
          <button
            onClick={handleAddProduct}
            className="flex items-center justify-center px-3 py-2 gap-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-md flex-1 mx-2"
          >
            <FiPlus className="w-6 h-6 mb-1" />
            <span className="text-sm font-medium">Add Product</span>
          </button>

          {/* Scan QR Button */}
          <button
            onClick={handleScanQR}
            className="flex items-center justify-center px-3 py-2 gap-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 shadow-md flex-1 mx-2"
          >
            <FiCamera className="w-6 h-6 mb-1" />
            <span className="text-sm font-medium">Scan QR</span>
          </button>
        </div>

        {/* Safe area padding for devices with home indicator */}
        <div className="h-safe-area-inset-bottom"></div>
      </div>

      {/* Bottom padding to prevent content from being hidden behind footer */}
      <div className="md:hidden h-20"></div>
    </>
  );
};

export default MobileFooter;
