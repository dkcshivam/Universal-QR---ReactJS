import { useEffect, useRef, useState } from "react";
import { Save, Plus } from "lucide-react";
import { FiUpload, FiCamera } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import CameraModal from "./CameraModal";

const AddProduct = () => {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [remarks, setRemarks] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [departments, setDepartments] = useState([]);

  const coverFileInputRef = useRef(null);
  const coverCameraInputRef = useRef(null);
  const productFileInputRef = useRef(null);
  const productCameraInputRef = useRef(null);

  const [showCameraModal, setShowCameraModal] = useState(false);

  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageObj = {
        file,
        url: URL.createObjectURL(file),
      };
      setCoverImage(imageObj);
    }
  };

  const handleCameraCapture = (imageSrc) => {
    setCoverImage({ file: null, url: imageSrc });
  };

  const handleProductImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setProductImages((prev) => [...prev, ...imagePreviews]);
  };

  const handleRemoveCover = () => {
    if (coverImage?.url) URL.revokeObjectURL(coverImage.url);
    setCoverImage(null);
  };

  const handleRemoveProductImage = (index) => {
    const updated = [...productImages];
    URL.revokeObjectURL(updated[index].url);
    updated.splice(index, 1);
    setProductImages(updated);
  };
  async function fetchDepartments() {
    const token = localStorage.getItem("access_token");
    const res = await axios.get(`${BASE_URL}/qr/departments/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setDepartments(res.data.data);
  }
  useEffect(() => {
    fetchDepartments();
  }, []);

  // product create

  async function createProduct() {
    if (!productName.trim()) {
      toast.error("Please fill in the required fields.");
      return null;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Please login first to create a product.");
      return;
    }

    try {
      const productData = new FormData();

      productData.append("name", productName);
      productData.append("quantity", quantity || "");
      productData.append("department", department || "");
      productData.append("remark", remarks || "");
      productData.append("location", location || "");

      if (coverImage) {
        productData.append("cover_image", coverImage.file);
      }

      productImages.forEach((img) => {
        productData.append("product_images", img.file);
      })

      const response = await axios.post(`${BASE_URL}/qr/products/create/`,
        productData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.status === 201) {
        return response.data.data; // returning the created product data 
      }

      return null;
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.message || error.response.data.error || "Failed to create product";
        toast.error(errorMessage);
      }
      else if (error.request) {
        toast.error("Network error. Please check your connection.");
      }
      else {
        toast.error("An unexpected error occured.")
      }
    }

  }

  // create product and redirect to product-detail page 

  const handleSave = async () => {
    const product = await createProduct();
    if (product) {
      toast.success("Product created! Redirecting to details...");
      navigate(`/product-detail/${product.product_code}/`);
    }
  }

  // create product and redirect to the same 'AddNewProduct' page (if the user wants to add more product)

  const handleSaveAndCreateNew = async () => {
    const product = await createProduct();

    if (product) {
      toast.success("Product created! You can add another.");

      setProductName("");
      setQuantity("");
      setLocation("");
      setDepartment("");
      setRemarks("");
      setCoverImage(null);
      setProductImages([]);
    }
  }

  // product created and user remains on the same page to add more products 

  return (
    <div className="min-h-screen bg-gray-50 space-y-4">
      <div className="flex items-center justify-start bg-white w-full md:max-w-4xl rounded-2xl mx-auto shadow-md gap-2 p-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-400 hover:bg-blue-500 rounded-lg text-white transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-medium">Go Back</span>
        </button>

        <div className="flex justify-center flex-1 gap-2">
          <h1 className="text-xl font-bold text-gray-800">Add New Product</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-3 sm:p-6 space-y-3 sm:space-y-6">
        {/* Product Name */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter product name..."
            className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
        </div>

        {/* Quantity & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Quantity</label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity..."
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location..."
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block font-semibold mb-1">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {departments.map((dept) => (
              <option key={dept.key} value={dept.key}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>

        {/* Remarks */}
        <div>
          <label className="block font-semibold mb-1">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any additional notes or remarks..."
            // maxLength={500}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block font-medium text-gray-700 mb-3">Cover Image</label>
          {!coverImage ? (
            <label className="border-2 border-dashed border-blue-300 rounded-md bg-gray-50 flex flex-col items-center justify-center h-52 text-center px-4 py-6 text-gray-500 cursor-pointer transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              <span className="text-3xl font-bold text-gray-400">+</span>
              <p className="mt-1 font-medium text-gray-600">
                Upload cover image
              </p>
            </label>
          ) : (
            <div className="relative w-full max-w-lg">
              <img
                src={coverImage.url}
                alt="cover preview"
                className="w-full h-52 object-cover rounded-lg border border-blue-200"
              />
              <button
                type="button"
                onClick={handleRemoveCover}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex gap-4 mt-3">
            <button
              type="button"
              onClick={() => coverFileInputRef.current.click()}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer"
            >
              <FiUpload />
              Upload Cover
            </button>
            <button
              type="button"
              onClick={() => setShowCameraModal(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer"
            >
              <FiCamera />
              Take Photo
            </button>

            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              ref={coverFileInputRef}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCoverChange}
              ref={coverCameraInputRef}
              className="hidden"
            />
          </div>
        </div>

        {/* Product Images */}
        <div>
          <label className="block font-medium text-gray-700 mb-3">
            Product Images
          </label>

          {productImages.length === 0 ? (
            <label className="border-2 border-dashed border-blue-300 rounded-md bg-gray-50 flex flex-col items-center justify-center h-52 text-center px-4 py-6 text-gray-500 cursor-pointer transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleProductImagesChange}
                className="hidden"
              />
              <span className="text-3xl font-bold text-gray-400">+</span>
              <p className="mt-1 font-medium text-gray-600">
                Add product images
              </p>
              <p className="text-sm text-gray-400">Multiple images allowed</p>
            </label>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {productImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.url}
                    alt={`preview-${index}`}
                    className="w-full h-52 object-cover rounded-lg border border-blue-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveProductImage(index)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 mt-3">
            <button
              type="button"
              onClick={() => productFileInputRef.current.click()}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer"
            >
              <FiUpload />
              Upload Images
            </button>
            <button
              type="button"
              onClick={() => setShowCameraModal(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer"
            >
              <FiCamera />
              Take Photo
            </button>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleProductImagesChange}
              ref={productFileInputRef}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleProductImagesChange}
              ref={productCameraInputRef}
              className="hidden"
            />
          </div>
        </div>

        {/* Save Buttons */}

        <div className="flex flex-row gap-3 mt-10 justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg shadow hover:bg-emerald-600 transition cursor-pointer font-semibold"
          >
            <Save size={18} />
            Save
          </button>
          <button
            onClick={handleSaveAndCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg shadow hover:bg-emerald-600 transition cursor-pointer font-semibold"
          >
            <Plus size={18} />
            Save & Create New
          </button>
        </div>
      </div>

      {/* camera modal */}

      {showCameraModal && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}

    </div>
  );
};

export default AddProduct;
