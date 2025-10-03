import { useEffect, useRef, useState } from "react";
import { Save, Plus, SunMoon } from "lucide-react";
import { FiUpload, FiCamera } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import CameraModal from "./CameraModal";
import { FiAlertCircle } from "react-icons/fi";

const AddProduct = () => {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [remarks, setRemarks] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [activeCamera, setActiveCamera] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [departments, setDepartments] = useState([]);

  const coverFileInputRef = useRef(null);
  const coverCameraInputRef = useRef(null);
  const productFileInputRef = useRef(null);
  const productCameraInputRef = useRef(null);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showProductCodeModal, setShowProductCodeModal] = useState(false);
  const [productCode, setProductCode] = useState("");
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL;
  const FORM_STORAGE_KEY = "addProductFormData";

  // Save form data to localStorage
  const saveFormData = () => {
    const formData = {
      productName,
      quantity,
      location,
      department,
      remarks,
      productCode,
      timestamp: Date.now(),
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  };

  // Load form data from localStorage
  const loadFormData = () => {
    try {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Only restore if data is less than 1 day old
        if (Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000) {
          setProductName(parsedData.productName || "");
          setQuantity(parsedData.quantity || "");
          setLocation(parsedData.location || "");
          setDepartment(parsedData.department || "");
          setRemarks(parsedData.remarks || "");
          setProductCode(parsedData.productCode || "");
        } else {
          // Clear old data
          localStorage.removeItem(FORM_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error loading form data:", error);
    }
  };

  // Clear saved form data
  const clearFormData = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
  };

  // Handle product code modal close/save
  const handleProductCodeModalClose = async (shouldSave = false) => {
    if (shouldSave) {
      // Validate product code if user wants to save
      if (!productCode.trim()) {
        toast.error("Please enter a product code");
        return;
      }

      try {
        const token = localStorage.getItem("access_token");

        // Call the validation API
        const response = await axios.get(
          `${BASE_URL}/qr/validate-code/${productCode.trim()}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // If API doesn't throw error, code is available
        toast.success("Product code is available and saved!");
        setShowProductCodeModal(false);
      } catch (error) {
        // If API returns error, code already exists
        if (error.response) {
          toast.error(
            "Product code already exists. Please choose a different code."
          );
        } else {
          toast.error("Error validating product code. Please try again.");
        }
        // Clear the input field and keep modal open
        setProductCode("");
        return;
      }
    } else {
      // Just close modal without saving
      setShowProductCodeModal(false);
    }
  };

  useEffect(() => {
    if (showCameraModal) {
      document.body.classList.add("hide-footer");
    } else {
      document.body.classList.remove("hide-footer");
    }
  }, [showCameraModal]);

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
    // Convert base64 data URL to File object
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `camera-image-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        const imageObj = {
          file,
          url: imageSrc,
        };
        if (activeCamera === "cover") {
          setCoverImage(imageObj);
        } else if (activeCamera === "product") {
          setProductImages((prev) => [...prev, imageObj]);
        }
        // setCoverImage(imageObj);
      })
      .catch((error) => {
        console.error("Error converting image:", error);
        // Fallback: keep original behavior
        setCoverImage({ file: null, url: imageSrc });
      });
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
    loadFormData(); // Load saved form data on component mount
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Save form data whenever inputs change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        productName ||
        quantity ||
        location ||
        department ||
        remarks ||
        productCode
      ) {
        saveFormData();
      }
    }, 1000); // Debounce saving by 1 second

    return () => clearTimeout(timeoutId);
  }, [productName, quantity, location, department, remarks, productCode]);

  // Handle app visibility change (when user switches apps)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App going to background - save data immediately
        saveFormData();
      }
    };

    const handleBeforeUnload = () => {
      // Save data before page unload
      saveFormData();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [productName, quantity, location, department, remarks, productCode]);

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
      productData.append("code", productCode || "");
      productData.append("location", location || "");

      if (coverImage) {
        productData.append("cover_image", coverImage.file);
      }

      productImages.forEach((img) => {
        productData.append("product_images", img.file);
      });

      const response = await axios.post(
        `${BASE_URL}/qr/products/create/`,
        productData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        return response.data.data; // returning the created product data
      }

      return null;
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          "Failed to create product";
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occured.");
      }
    }
  }

  // create product and redirect to product-detail page

  const handleSave = async () => {
    const product = await createProduct();
    if (product) {
      clearFormData(); // Clear saved data after successful creation
      toast.success("Product created! Redirecting to details...");
      navigate(`/product-detail/${product.product_code}/`);
    }
  };

  // create product and redirect to the same 'AddNewProduct' page (if the user wants to add more product)

  const handleSaveAndCreateNew = async () => {
    const product = await createProduct();

    if (product) {
      clearFormData(); // Clear saved data after successful creation
      toast.success("Product created! You can add another.");

      setProductName("");
      setQuantity("");
      setLocation("");
      setDepartment("");
      setRemarks("");
      setCoverImage(null);
      setProductImages([]);
      setProductCode("");
    }
  };

  // product created and user remains on the same page to add more products

  return (
    <div className="min-h-screen bg-gray-50 space-y-4">
      <div className="flex items-center justify-start bg-white w-full md:max-w-4xl rounded-2xl mx-auto shadow-md gap-2 p-4">
        <div>
          <button
            onClick={() => window.history.back()}
            className="mr-4 inline-flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-400 hover:bg-blue-500 rounded-lg text-white transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base font-medium">Back</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg shadow-sm font-semibold text-sm lg:text-base cursor-pointer transition-all duration-200"
            aria-label="Go Back"
          >
            <span>Home</span>
          </button>
        </div>
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

        {/* Add Custom Product Code Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowProductCodeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-gray-700 transition-colors duration-200"
          >
            <Plus size={16} />
            Add Custom Product Code
          </button>
          {productCode && (
            <div className="mt-2 text-sm text-gray-600">
              Product Code: <span className="font-medium">{productCode}</span>
            </div>
          )}
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

        {/* Cover Image */}
        <div>
          <label className="block font-medium text-gray-700 mb-3">
            Cover Image
          </label>
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
              onClick={() => {
                setShowCameraModal(true);
                setActiveCamera("cover");
              }}
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
              onClick={() => {
                setShowCameraModal(true);
                setActiveCamera("product");
              }}
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

        {/* Info Box for End Users */}

        <div className="mt-6 rounded-lg p-4 text-sm text-black">
          <ul className="list-disc pl-5 mt-2">
            <li>
              <span className="font-semibold">Save:</span> Creates the product
              and redirects you to its detail page.
            </li>
            <li>
              <span className="font-semibold">Save &amp; Create New:</span>{" "}
              Creates the product and keeps you on this page so you can add more
              products.
            </li>
          </ul>
          <div className="mt-2">
            <span className="font-medium">💡 Tip:</span> Use "Save &amp; Create
            New" if you need to add multiple products quickly!
          </div>
        </div>
      </div>

      {/* Product Code Modal */}
      {showProductCodeModal && (
        <div
          className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(128, 128, 128, 0.3)" }}
        >
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Add Custom Product Code
              </h3>
              <button
                onClick={() => handleProductCodeModalClose(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Product Code
                </label>
                <input
                  type="text"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="Enter custom product code..."
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => handleProductCodeModalClose(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleProductCodeModalClose(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
