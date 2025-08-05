import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import axios from "axios";
import { set } from "lodash";
function CreateMultipleProduct() {
  const createNewProductRow = () => ({
    id: Date.now() + Math.random(),
    name: "",
    location: "",
    department: "",
    quantity: "",
    coverImage: null, // File object
    coverImageUrl: "", // Preview URL
    productImages: [], // Array of File objects
    productImageUrls: [], // Array of preview URLs
  });
  const [departments, setDepartments] = useState([]);
  const [productRows, setProductRows] = useState([createNewProductRow()]);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [hide, sethide] = useState(false);
  const [lottieData, setLottieData] = useState(null) ; 

   // Number of products per page

  // in Vite (CRA), the public folder is not part of the module system. Files in 'public' are served as static assets, not imported as modules

  useEffect(() => {
    fetch('/media/lottie-spinner.json') 
      .then(res => res.json())
      .then(data => setLottieData(data)) ; 
     
  }, [hide])
  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedRows = [...productRows];
    updatedRows[index] = { ...updatedRows[index], [name]: value };
    setProductRows(updatedRows);

    // Auto-add new row if editing the last row and any field is changed
    if (index === productRows.length - 1) {
      const row = updatedRows[index];
      if (
        row.name !== "" ||
        row.location !== "" ||
        row.department !== "" ||
        row.coverImage ||
        (row.productImages && row.productImages.length > 0) ||
        row.quantity !== 1
      ) {
        setProductRows([...updatedRows, createNewProductRow()]);
      }
    }
  };

  // Cover image upload
  const handleCoverImageChange = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;
    const updatedRows = [...productRows];
    updatedRows[index].coverImage = file;
    updatedRows[index].coverImageUrl = URL.createObjectURL(file);
    setProductRows(updatedRows);
  };

  const handleRemoveCoverImage = (index) => {
    const updatedRows = [...productRows];
    updatedRows[index].coverImage = null;
    updatedRows[index].coverImageUrl = "";
    setProductRows(updatedRows);
  };

  // Product images upload (multiple)
  const handleProductImagesChange = (index, event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    const updatedRows = [...productRows];
    updatedRows[index].productImages = [
      ...updatedRows[index].productImages,
      ...files,
    ];
    updatedRows[index].productImageUrls = [
      ...updatedRows[index].productImageUrls,
      ...files.map((file) => URL.createObjectURL(file)),
    ];
    setProductRows(updatedRows);
  };

  const handleRemoveProductImage = (rowIndex, imgIndex) => {
    const updatedRows = [...productRows];
    updatedRows[rowIndex].productImages.splice(imgIndex, 1);
    updatedRows[rowIndex].productImageUrls.splice(imgIndex, 1);
    setProductRows(updatedRows);
  };

  const handleRemoveRow = (index) => {
    if (productRows.length > 1) {
      const updatedRows = productRows.filter((_, i) => i !== index);
      setProductRows(updatedRows);
    }
  };

  const handleSaveAll = async () => {
    for (const product of productRows.slice(0, -1)) {
      if (!product.name.trim()) {
        toast.error("Product name is required.");
        return;
      }
      if (product.name.trim().length < 3) {
        toast.error("Product name must be at least 3 characters.");
        return;
      }
    }

    // remove empty last row if present
    sethide(true);
    const filteredRows = productRows.filter(
      (row) =>
        row.name.trim() !== "" ||
        row.location.trim() !== "" ||
        row.department.trim() !== ""
    );

    let data = [];
    for (const product of productRows.slice(0, -1)) {
      data.push({
        name: product.name,
        location: product.location,
        department: product.department,
        quantity: product.quantity || 1,
        cover_image: product.coverImage,
        product_images: product.productImages,
      });
    }
    
    const token = localStorage.getItem("access_token");
    const res = await axios.post(`${BASE_URL}/qr/products/bulk-create/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    if (res.status !== 201) {
      toast.error("Failed to save products.");
      sethide(false);
      return;
    }
    // toast.success("Saving the products will take some time ");
    console.log("Saving the following products: ", res);

    toast.success(`${data.length} products saved successfully!`);
    setProductRows([createNewProductRow()]);
    navigate("/"); // Redirect to products page after saving
    
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
  const navigate = useNavigate();
  return hide ? (
    <div className="flex items-center justify-center h-[60vh]">
      <Lottie
        animationData={lottieData}
        loop={true}
        style={{ width: 120, height: 120 }}
      />
    </div>
  ) : (
    <div className=" left-0 right-0  min-h-screen bg-white shadow-md overflow-x-auto p-4 box-border overflow-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg shadow-sm font-semibold text-sm lg:text-base cursor-pointer transition-all duration-200"
        aria-label="Go Back"
      >
        <FaArrowLeft className="w-4 h-4 " />
        <span>Back</span>
      </button>
      <div className="flex items-center justify-between mb-5 px-2">
        <h1 className="text-xl font-semibold">Create Multiple Products</h1>
        <button
          disabled={hide}
          className="save-all-btn flex items-center gap-2"
          onClick={handleSaveAll}
        >
          <FaSave />
          Save All Products
        </button>
      </div>
      <table
        className="create-product-table"
        style={{ width: "100%", tableLayout: "fixed" }}
      >
        <colgroup>
          <col style={{ width: "120px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "110px" }} />
          <col style={{ width: "60px" }} />
          <col style={{ width: "90px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "50px" }} />
        </colgroup>
        <thead>
          <tr>
            <th>
              Product Name
              <span style={{ color: "red" }}>*</span>
            </th>
            <th>Location</th>
            <th>Department</th>
            <th style={{ width: "70px" }}>Quantity</th>
            <th style={{ width: "110px" }}>Cover Image</th>
            <th style={{ width: "160px" }}>Product Images</th>
            <th style={{ width: "60px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {productRows.map((row, index) => (
            <tr key={row.id}>
              <td>
                <input
                  type="text"
                  name="name"
                  value={row.name}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="e.g., Leather Jacket"
                  className="form-input"
                  required
                  style={{ width: "100%" }}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="location"
                  value={row.location}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="e.g., Factory"
                  className="form-input"
                  style={{ width: "100%" }}
                />
              </td>
              <td>
                <select
                  name="department"
                  value={row.department}
                  onChange={(e) => handleInputChange(index, e)}
                  className="form-input"
                  style={{ width: "100%" }}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.key} value={dept.key}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </td>
              <td style={{ width: "70px", textAlign: "center" }}>
                <input
                  type="text"
                  name="quantity"
                  value={row.quantity}
                  min={1}
                  onChange={(e) => handleInputChange(index, e)}
                  className="form-input"
                  style={{ width: "60px" }}
                />
              </td>

              {/* Cover Image */}

              <td style={{ width: "90px", textAlign: "center" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "center",
                  }}
                >
                  {row.coverImageUrl && (
                    <div
                      style={{ position: "relative", width: 100, height: 140 }}
                    >
                      <img
                        src={row.coverImageUrl || ""}
                        alt="Cover"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid #eee",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCoverImage(index)}
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          background: "white",
                          border: "1px solid #ccc",
                          borderRadius: "50%",
                          cursor: "pointer",
                          padding: 2,
                        }}
                      >
                        <FaTimes color="red" size={10} />
                      </button>
                    </div>
                  )}
                  {!row.coverImageUrl && (
                    <label
                      style={{
                        width: 40,
                        height: 40,
                        border: "1px dashed #2563eb",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        background: "#f8fafc",
                        marginLeft: row.coverImageUrl ? 4 : 0,
                        padding: 0,
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleCoverImageChange(index, e)}
                      />
                      <FaPlus
                        style={{ color: "#2563eb", fontSize: 18, margin: 0 }}
                      />
                    </label>
                  )}
                </div>
              </td>

              {/* Product Images */}

              <td style={{ width: "140px", textAlign: "center" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {row.productImageUrls &&
                    row.productImageUrls.map((url, imgIdx) => (
                      <div
                        key={imgIdx}
                        style={{
                          position: "relative",
                          width: 100,
                          height: 140,
                        }}
                      >
                        <img
                          src={url}
                          alt="Product"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #eee",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveProductImage(index, imgIdx)
                          }
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            background: "white",
                            border: "1px solid #ccc",
                            borderRadius: "50%",
                            cursor: "pointer",
                            padding: 1,
                          }}
                        >
                          <FaTimes color="red" size={8} />
                        </button>
                      </div>
                    ))}
                  <label
                    style={{
                      width: 40,
                      height: 40,
                      border: "1px dashed #2563eb",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      background: "#f8fafc",
                      padding: 0,
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => handleProductImagesChange(index, e)}
                    />
                    <FaPlus
                      style={{ color: "#2563eb", fontSize: 16, margin: 0 }}
                    />
                  </label>
                </div>
              </td>

              {/* Action button */}

              <td style={{ width: "60px", textAlign: "center" }}>
                <button
                  className="remove-row-btn"
                  onClick={() => handleRemoveRow(index)}
                  disabled={productRows.length <= 1}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CreateMultipleProduct;
