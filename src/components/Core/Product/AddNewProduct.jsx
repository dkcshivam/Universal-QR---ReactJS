import { useEffect, useRef, useState } from "react";
import { Save, Plus } from "lucide-react";
import { FiUpload, FiCamera } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
const AddProduct = () => {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [remarks, setRemarks] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const coverFileInputRef = useRef(null);
  const coverCameraInputRef = useRef(null);
  const productFileInputRef = useRef(null);
  const productCameraInputRef = useRef(null);

  const navigate = useNavigate();

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
  useEffect(() => {
      const token = localStorage.getItem("access_token");
      const res = axios.get(
        "http://shivam-mac.local:8000/api/v1.0/qr/departments/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      console.log(res.data)

  }, [])
  
  async function handlesubmit() {
    if (!productName ) {
      alert("Please fill in all required fields");
      return;
    }

    const productData = {
      name: productName,
      cover_image: coverImage ? coverImage.file : null,
      product_images: productImages.map((img) => img.file),
      quantity: quantity,
      department: department,
      remark: remarks,
      location: location,
    };
    console.log(productData);
    const res = await axios.post(
      "http://shivam-mac.local:8000/api/v1.0/qr/products/create/",
      {
        name: productName,
        cover_image: coverImage ? coverImage.file : null,
        product_images: productImages.map((img) => img.file),
        quantity: quantity,
        department: department,
        remark: remarks,
        location: location,
      },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log(res);
    console.log("Product Data Submitted:", productData);
    // Reset form after submission
    setProductName("");
    setQuantity("");
    setLocation("");
    setDepartment("");
    setRemarks("");
    setCoverImage(null);
    setProductImages([]);
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-4">
      <div className="flex items-center justify-start bg-white rounded-2xl shadow-md gap-2 p-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 rounded-lg cursor-pointer"
        >
          <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
          <span className="text-sm sm:text-base">Go Back</span>
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
            className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
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
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location..."
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block font-semibold mb-1">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select department...</option>
            <option value="Production">Production</option>
            <option value="Quality">Quality</option>
            <option value="Dispatch">Dispatch</option>
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
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={4}
          />
          {/* <div className="text-sm text-gray-400 text-right mt-1">
            {remarks.length}/500 characters
          </div> */}
        </div>

        {/* Cover Image */}
        <div>
          <label className="block font-medium text-gray-700">Cover Image</label>
          {!coverImage ? (
            <label className="border-2 border-dashed border-indigo-300 rounded-md bg-gray-50 flex flex-col items-center justify-center h-52 text-center px-4 py-6 text-gray-500 cursor-pointer transition">
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
                className="w-full h-52 object-cover rounded-lg border border-indigo-200"
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
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
            >
              <FiUpload />
              Upload Cover
            </button>
            <button
              type="button"
              onClick={() => coverCameraInputRef.current.click()}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
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
          <label className="block font-medium text-gray-700">
            Product Images
          </label>

          {productImages.length === 0 ? (
            <label className="border-2 border-dashed border-indigo-300 rounded-md bg-gray-50 flex flex-col items-center justify-center h-52 text-center px-4 py-6 text-gray-500 cursor-pointer transition">
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
                    className="w-full h-52 object-cover rounded-lg border border-indigo-200"
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
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
            >
              <FiUpload />
              Upload Images
            </button>
            <button
              type="button"
              onClick={() => productCameraInputRef.current.click()}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
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
        <div className="flex gap-4">
          <button
            onClick={handlesubmit}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg shadow hover:bg-emerald-600 transition"
          >
            <Save size={18} />
            Save
          </button>
          <button
            onClick={handlesubmit}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg shadow hover:bg-emerald-600 transition"
          >
            <Plus size={18} />
            Save & Create New
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
