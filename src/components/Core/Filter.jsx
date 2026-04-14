import { FiPlus, FiCamera } from "react-icons/fi";
import { IoIosCreate } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoMdDownload } from "react-icons/io";

const SearchFilter = () => {
  const navigate = useNavigate();

  let token = localStorage.getItem("access_token");

  return (
    <>
      {token && (
        <div className="flex items-center justify-end w-full bg-white rounded-lg p-2 mb-4">

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
                  onClick={() => navigate("/add-product")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add New Product</span>
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
              onClick={() => navigate("/download-qr")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <IoMdDownload className="w-4 h-4" />
              <span className="text-sm font-medium cursor-pointer">
                Print QR Code
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchFilter;
