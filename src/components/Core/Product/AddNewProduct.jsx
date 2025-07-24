import { useState } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaImage,
  FaUpload,
  FaCamera,
  FaPlus,
  FaSave,
  FaPlusCircle,
  FaTimes,
} from "react-icons/fa";

export default function AddNewProduct() {
  const [coverImage, setCoverImage] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [remarksCount, setRemarksCount] = useState(0);

  const saveProduct = () => {
    console.log("Saving product...");
  };

  const handleCoverUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProductImagesUpload = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file)
      );
      setProductImages((prev) => [...prev, ...files]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md rounded-lg py-4 px-4 flex items-center gap-4">
        <button className="flex items-center text-blue-500 hover:text-blue-700">
          <FaArrowLeft className="mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-xl font-bold text-gray-800">Add New Product</h1>
      </header>

      {/* Main content */}
      <main className="mt-6 max-w-3xl mx-auto">
        {/* Success message */}
        <div className="hidden text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <FaCheckCircle />
          <span>Product saved successfully!</span>
        </div>

        {/* Form */}
        <form className="bg-white p-6 rounded-xl shadow space-y-6">
          {/* Product Name */}
          <div>
            <label className="block font-semibold mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Enter product name..."
            />
            <p className="text-red-500 text-sm mt-1 hidden">
              Product name is required
            </p>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block font-semibold mb-1">Cover Image</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={() => document.getElementById("coverInput").click()}
            >
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <>
                  <FaImage className="text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-500">Click to add cover image</p>
                  <small className="text-gray-400">
                    Supports JPG, PNG, WebP (Max 5MB)
                  </small>
                </>
              )}
            </div>
            <div className="flex gap-4 mt-3">
              <button
                type="button"
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={() => document.getElementById("coverInput").click()}
              >
                <FaUpload /> Upload Cover
              </button>
              <button
                type="button"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                <FaCamera /> Take Photo
              </button>
            </div>
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <p className="text-red-500 text-sm mt-1 hidden">
              Cover image is required
            </p>
          </div>

          {/* Product Images */}
          <div>
            <label className="block font-semibold mb-1">Product Images</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={() =>
                document.getElementById("productImagesInput").click()
              }
            >
              <FaPlus className="text-2xl text-gray-400 mb-2" />
              <p className="text-gray-500">Add product images</p>
              <small className="text-gray-400">Multiple images allowed</small>
            </div>
            <div className="flex gap-4 mt-3">
              <button
                type="button"
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={() =>
                  document.getElementById("productImagesInput").click()
                }
              >
                <FaUpload /> Upload Images
              </button>
              <button
                type="button"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                <FaCamera /> Take Photo
              </button>
            </div>
            <input
              id="productImagesInput"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleProductImagesUpload}
            />
            {productImages.length > 0 && (
              <div className="mt-4">
                <div className="font-semibold mb-2">Uploaded Images:</div>
                <div className="grid grid-cols-3 gap-2">
                  {productImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Product ${idx}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
            <p className="text-red-500 text-sm mt-1 hidden">
              At least one product image is required
            </p>
          </div>

          {/* Quantity and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max="10000"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter quantity..."
              />
              <p className="text-red-500 text-sm mt-1 hidden">
                Please enter a valid quantity
              </p>
            </div>
            <div>
              <label className="block font-semibold mb-1">Location</label>
              <input
                type="text"
                maxLength="50"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter location..."
              />
              <p className="text-red-500 text-sm mt-1 hidden">
                Please enter a location
              </p>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block font-semibold mb-1">Department</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200">
              <option value="">Select department...</option>
              <option value="sampling">Sampling</option>
              <option value="production">Production</option>
              <option value="tech">Tech</option>
              <option value="hardgoods">Hard Goods</option>
            </select>
            <p className="text-red-500 text-sm mt-1 hidden">
              Please select a department
            </p>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold mb-1">Remarks</label>
            <textarea
              maxLength="500"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-y"
              placeholder="Add any additional notes or remarks..."
              onChange={(e) => setRemarksCount(e.target.value.length)}
            ></textarea>
            <div className="text-right text-gray-400 text-xs mt-1">
              {remarksCount}/500 characters
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg shadow"
              onClick={() => saveProduct()}
            >
              <FaSave /> Save
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg shadow"
            >
              <FaPlusCircle /> Save & Create New
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
