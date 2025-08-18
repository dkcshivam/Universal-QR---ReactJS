import { FiPlus, FiCamera } from "react-icons/fi";
import { IoIosCreate } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoMdDownload } from "react-icons/io";
import { toast } from "react-toastify";

const SearchFilter = ({ onAddProduct, activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  let token = localStorage.getItem("access_token");

  return (
    <>
      {token && (
        <div className="flex items-center justify-between w-full bg-white rounded-lg p-2 mb-4">
          {/* Left side - Mine/All tabs (Visible on all screens) */}

          {token ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveTab("mine");
                  toast.info("Showing your products only.", {
                    autoClose: 3000,
                  });
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "mine"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                }`}
              >
                Mine
              </button>
              <button
                onClick={() => {
                  setActiveTab("all");
                  toast.info("Showing all products", { autoClose: 3000 });
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                }`}
              >
                All
              </button>
            </div>
          ) : (
            // Empty div to maintain layout when tabs are hidden
            <div></div>
          )}

          <div className="hidden sm:flex items-center gap-3">
            {token && (
              <>
                <button
                  onClick={() => navigate("/scan")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <FiCamera className="w-4 h-4" />
                  <span className="text-sm font-medium">Scan QR Code</span>
                </button>
                <button
                  onClick={() => navigate("/download-qr")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <IoMdDownload className="w-4 h-4" />
                  <span className="text-sm font-medium">Download QR Code</span>
                </button>
                <button
                  onClick={() => navigate("/upload-multiple-product")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <IoIosCreate className="w-4 h-4" />
                  <span className="text-sm font-medium">Bulk Create</span>
                </button>
              </>
            )}

            <button
              onClick={onAddProduct}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <IoMdDownload className="w-4 h-4" />
              <span
                className="text-sm font-medium cursor-pointer"
                onClick={() => navigate("/download-qr")}
              >
                Download QR Code
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchFilter;
