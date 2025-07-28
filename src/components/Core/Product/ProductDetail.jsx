import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { FaPencilAlt,FaTrash } from "react-icons/fa";

import {
  FaQrcode,
  FaCommentAlt,
  FaKeyboard,
  FaMicrophone,
  FaTimes,
} from "react-icons/fa";
import { Edit } from "lucide-react";
import VoiceRecorder from "../Remarks/VoiceRecorder";
import AudioPlayer from "../Remarks/AudioPlayer";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function ProductDetail() {
  const token = localStorage.getItem("access_token");

  const { code, isEditable } = useParams();
  const [data, setData] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [newRemark, setNewRemark] = useState("");
  const [showRemarkForm, setShowRemarkForm] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [remarkType, setRemarkType] = useState("text");
  const [remarks, setRemarks] = useState([]);
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);
  const [remarkError, setRemarkError] = useState(null);

  // edit mode
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFields, setEditFields] = useState({
    name: "",
    department: "",
    quantity: "",
    location: "",
    cover_image: null,
  });

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/departments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDepartments(res.data.data || []);
      })
      .catch((err) => {
        setDepartments([]);
      });
  }, [token]);

  const handleEditClick = () => {
    if (!token) {
      toast.error("Please login again");
      return;
    }
    setEditFields({
      name: data?.name || "",
      department: data?.belongs_to_department || "",
      quantity: data?.quantity || "",
      location: data?.location || "",
      cover_image: null,
    });
    setIsEditMode(true);
  };

  const handleFieldChange = (e) => {
    setEditFields({
      ...editFields,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editFields.name);
      formData.append("belongs_to_department", editFields.department);
      formData.append("quantity", editFields.quantity);
      formData.append("location", editFields.location);
      if (editFields.cover_image) {
        formData.append("cover_image", editFields.cover_image);
      }

      await axios.put(`${API_BASE_URL}/products/${code}/edit/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      await getProductDetail();
      setIsEditMode(false);
      toast.success("Product updated successfully!");
    } catch (error) {
      console.log("handle update product failed: ", error);
      toast.error("Product update failed! Please try again.");
    }
  };

  const getProductDetail = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/qr/products/${code}/`);
      if (res.status === 200) {
        const productData = res?.data?.data;
        setData(productData);
      }
      console.log("Product data:", res.data.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };
  const handleSave = async (remarkId) => {
  // Call API here to save the updated remark
  // Example:
  try {
    await axios.put(`${API_BASE_URL}/qr/products/${code}/remarks/${remarkId}/edit/`, {
      remark: editedText,
    });

    // After successful update, update local state or refetch remarks
    const updatedRemarks = remarks.map((r) =>
      r.id === remarkId ? { ...r, remark: editedText } : r
    );
    setRemarks(updatedRemarks); // assuming remarks is in state
    setEditingId(null);
  } catch (error) {
    console.error("Error updating remark", error);
    // Optionally show toast/error
  }
};
const handleDeleteRemark = async (remarkId) => {
  try {
    await axios.delete(`${API_BASE_URL}/qr/products/${code}/remarks/${remarkId}/delete/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Remove the deleted remark from local state
   getRemarks()
    toast.success("Remark deleted successfully!");
  } catch (error) {
    console.error("Error deleting remark:", error);
    toast.error("Failed to delete remark. Please try again.");
  }
}
  // Get remarks for the product
  const getRemarks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/qr/remarks/${code}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 200) {
        const remarksData = res?.data?.data || [];
        console.log("Remarks data:", remarksData);
        setRemarks(remarksData);
      }
    } catch (error) {
      console.error("Error fetching remarks:", error);
      // If no remarks found, just set empty array
      setRemarks([]);
    }
  };

  // Submit text remark to API
  const submitTextRemark = async (remarkText) => {
    try {
      setIsSubmittingRemark(true);
      setRemarkError(null);

      if (!token) {
        toast.error("First login after then write a reviews");
        return;
      }

      const payload = {
        remark_type: "text",
        remark: remarkText,
        product_code: code,
      };

      const res = await axios.post(
        `${API_BASE_URL}/qr/remarks/${code}/`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        console.log("Text remark created:", res.data);
        // Refresh remarks list
        await getRemarks();
        return true;
      }
    } catch (error) {
      console.error("Error creating text remark:", error);
      setRemarkError("Failed to save text remark. Please try again.");
      return false;
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  // Submit voice remark to API
  const submitVoiceRemark = async (audioData, remarkText = "") => {
    try {
      setIsSubmittingRemark(true);
      setRemarkError(null);

      if (!token) {
        toast.error("First login after then write a reviews");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append(
        "audio_duration",
        `${Math.floor(audioData.duration / 60)}:${audioData.duration % 60}`
      );

      // Convert blob to file and append
      const audioFile = new File(
        [audioData.audioBlob],
        `voice_remark_${Date.now()}.mp3`,
        {
          type: audioData.mimeType || "audio/mp3",
        }
      );
      formData.append("remark_audio", audioFile);

      const res = await axios.post(
        `${API_BASE_URL}/qr/remarks/${code}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        console.log("Voice remark created:", res.data);
        // Refresh remarks list
        await getRemarks();
        return true;
      }
    } catch (error) {
      console.error("Error creating voice remark:", error);
      setRemarkError("Failed to save voice remark. Please try again.");
      return false;
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  useEffect(() => {
    if (code) {
      getProductDetail();
      getRemarks();
    }
  }, [code]);

  // const openModal = (imageSrc) => {
  //   setSelectedImage(imageSrc);
  // };

  // const closeModal = () => {
  //   setSelectedImage(null);
  // };

  const handleAddTextRemark = async () => {
    if (newRemark.trim()) {
      const success = await submitTextRemark(newRemark.trim());
      if (success) {
        setNewRemark("");
        setShowRemarkForm(false);
      }
    }
  };

  const handleAddVoiceRemark = async (audioData) => {
    const success = await submitVoiceRemark(audioData);
    if (success) {
      setShowVoiceRecorder(false);
      setShowRemarkForm(false);
    }
  };

  const handleCancelVoiceRecording = () => {
    setShowVoiceRecorder(false);
    setShowRemarkForm(false);
    setRemarkError(null);
  };

  const handleShowRemarkForm = (type) => {
    setRemarkType(type);
    setShowRemarkForm(true);
    setRemarkError(null);
    if (type === "audio") {
      setShowVoiceRecorder(true);
    } else {
      setShowVoiceRecorder(false);
    }
  };

  const handleCancelRemark = () => {
    setShowRemarkForm(false);
    setShowVoiceRecorder(false);
    setNewRemark("");
    setRemarkError(null);
  };

  const handleDownloadQR = async () => {
    try {
      if (!data?.qr) {
        alert("QR code not available for this product");
        return;
      }

      // Show loading state (optional)
      console.log("Downloading QR code...");

      // Fetch the image as a blob
      const response = await fetch(data.qr, {
        method: "GET",
        headers: {
          Accept: "image/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create object URL from blob
      const url = window.URL.createObjectURL(blob);

      // Create temporary anchor element for download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(data.name || data.code).replace(
        /[^a-zA-Z0-9\s]/g,
        "_"
      )}_QR.png`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL to free memory
      window.URL.revokeObjectURL(url);

      console.log("QR code downloaded successfully for:", data.name);
    } catch (error) {
      console.error("Error downloading QR code:", error);

      // Fallback: try opening in new tab if fetch fails
      try {
        window.open(data.qr, "_blank");
        console.log("Opened QR code in new tab as fallback");
      } catch (fallbackError) {
        alert(
          "Failed to download QR code. Please try again or check your internet connection."
        );
      }
    }
  };

  // Format date from API response
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
    } catch (error) {
      return dateString.split("T")?.[0]?.split("-")?.reverse()?.join("/") || "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex flex-col gap-4 lg:p-6">
        {/* Main Content Container */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Left Side: Product Info */}
          <div className="flex-1 flex flex-col gap-6 p-4 lg:p-8 bg-white rounded-md shadow-md">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-xl lg:text-3xl text-[#1e293b] font-bold capitalize break-words">
                  {data.name}{" "}
                  <span className="text-sm lg:text-lg text-gray-400 block lg:inline">
                    (#{data.code})
                  </span>
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row items-stretch sm:items-center gap-2 lg:gap-4">
                <button
                  className="inline-flex items-center justify-center gap-2 bg-[#3b82f6] text-white px-3 py-2 lg:px-4 lg:py-2 rounded-md shadow-md cursor-pointer transition-all duration-300 text-sm flex-1 md:flex-none lg:text-base"
                  onClick={handleDownloadQR}
                  disabled={!data?.qr}
                >
                  <FaQrcode className="text-white" />
                  <span className="hidden sm:inline">Download QR</span>
                  <span className="sm:hidden">QR Code</span>
                </button>

                {/* Edit product  */}

                {isEditMode && isEditable === "true" ? (
                  <button
                    className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-md shadow-md cursor-pointer transition-all duration-300 text-sm flex-1 sm:flex-none lg:text-base hover:bg-green-700"
                    onClick={handleUpdateProduct}
                  >
                    <Edit className="text-white w-4 h-4" />
                    <span className="hidden sm:inline">Update Product</span>
                    <span className="sm:hidden">Update</span>
                  </button>
                ) : (
                  isEditable === "true" && (
                    <button
                      className="inline-flex items-center justify-center gap-2 bg-[#3b82f6] text-white px-3 py-2 lg:px-4 lg:py-2 rounded-md shadow-md cursor-pointer transition-all duration-300 text-sm flex-1 sm:flex-none lg:text-base hover:bg-[#7594c7]"
                      onClick={handleEditClick}
                    >
                      <Edit className="text-white w-4 h-4" />
                      <span className="hidden sm:inline">Edit Product</span>
                      <span className="sm:hidden">Edit</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Name */}
            {isEditMode && (
              <div className="flex flex-col gap-2 mb-2">
                <div className="text-xs lg:text-sm font-semibold text-gray-500 uppercase">
                  PRODUCT NAME
                </div>
                <input
                  name="name"
                  value={editFields.name}
                  onChange={handleFieldChange}
                  placeholder="Enter product name here"
                  className="bg-[#f8fafc] text-[#374151] px-3 py-2 rounded-md border border-[#e2e8f0] text-sm lg:text-base"
                />
              </div>
            )}

            {/* Cover Image */}

            {isEditMode && (
              <div className="flex flex-col gap-2 mb-2">
                <div className="text-xs lg:text-sm font-semibold text-gray-500 uppercase">
                  COVER IMAGE
                </div>
                {editFields.cover_image ? (
                  <div className="relative w-32 h-32">
                    <img
                      src={URL.createObjectURL(editFields.cover_image)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                      onClick={() =>
                        setEditFields({ ...editFields, cover_image: null })
                      }
                      type="button"
                    >
                      <FaTimes className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-md bg-gray-50 w-32 h-32 cursor-pointer hover:bg-indigo-50 transition">
                    <FaPlus className="text-indigo-400 text-2xl mb-1" />
                    <span className="text-gray-500 text-xs">
                      Upload Cover Image
                    </span>
                    <input
                      type="file"
                      name="cover_image"
                      accept="image/*"
                      onChange={(e) =>
                        setEditFields({
                          ...editFields,
                          cover_image: e.target.files[0],
                        })
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Product Info Grid */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Department */}

              {isEditMode ? (
                <select
                  name="department"
                  value={editFields.department}
                  onChange={handleFieldChange}
                  className="bg-transparent outline-none flex-1"
                >
                  <option value="">Select Department</option>
                  {departments.map((dep, idx) => (
                    <option key={dep.id || idx} value={dep.name || ""}>
                      {dep.name || "Unknown"}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="inline-flex items-center gap-2 bg-[#f8fafc] text-[#374151] px-3 py-2 lg:px-4 lg:py-2 rounded-md border border-[#e2e8f0] text-sm lg:text-base">
                  <span>
                    {!data?.belongs_to_department
                      ? "N/A"
                      : data?.belongs_to_department}
                  </span>
                </div>
              )}

              {/* quantity */}

              <div className="flex flex-col gap-2">
                <div className="text-xs lg:text-sm font-semibold text-gray-500 uppercase">
                  QUANTITY
                </div>
                <div className="inline-flex items-center gap-2 bg-[#f8fafc] text-[#374151] px-3 py-2 lg:px-4 lg:py-2 rounded-md border border-[#e2e8f0] text-sm lg:text-base">
                  {isEditMode ? (
                    <input
                      name="quantity"
                      type="number"
                      value={editFields.quantity}
                      onChange={handleFieldChange}
                      className="bg-transparent outline-none flex-1"
                    />
                  ) : (
                    <span>
                      {!data?.quantity ? "N/A" : `${data?.quantity} Items`}
                    </span>
                  )}
                </div>
              </div>

              {/* location */}

              <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
                <div className="text-xs lg:text-sm font-semibold text-gray-500 uppercase">
                  LOCATION
                </div>
                <div className="inline-flex items-center gap-2 bg-[#f8fafc] text-[#374151] px-3 py-2 lg:px-4 lg:py-2 rounded-md border border-[#e2e8f0] text-sm lg:text-base">
                  {isEditMode ? (
                    <input
                      name="location"
                      value={editFields.location}
                      onChange={handleFieldChange}
                      className="bg-transparent outline-none flex-1"
                    />
                  ) : (
                    <span>{!data?.location ? "N/A" : data?.location}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            <div className="mt-4 lg:mt-6">
              {/* Error Message */}
              {remarkError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {remarkError}
                </div>
              )}
              {!showRemarkForm ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm lg:text-base"
                    onClick={() => handleShowRemarkForm("text")}
                    disabled={isSubmittingRemark}
                  >
                    <FaKeyboard className="w-4 h-4" />
                    <span>Add Text Remark</span>
                  </button>

                  <button
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm lg:text-base"
                    onClick={() => handleShowRemarkForm("audio")}
                    disabled={isSubmittingRemark}
                  >
                    <FaMicrophone className="w-4 h-4" />
                    <span>Add Voice Remark</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {showVoiceRecorder ? (
                    <div className="w-full lg:w-[60%]">
                      <VoiceRecorder
                        onSave={handleAddVoiceRemark}
                        onCancel={handleCancelVoiceRecording}
                        disabled={isSubmittingRemark}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Add Text Remark
                      </h3>
                      <textarea
                        value={newRemark}
                        onChange={(e) => setNewRemark(e.target.value)}
                        placeholder="Write your remark here..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                        rows="4"
                        disabled={isSubmittingRemark}
                      />
                      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-3">
                        <button
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm lg:text-base"
                          onClick={handleCancelRemark}
                          disabled={isSubmittingRemark}
                        >
                          Cancel
                        </button>
                        <button
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm lg:text-base"
                          onClick={handleAddTextRemark}
                          disabled={isSubmittingRemark || !newRemark.trim()}
                        >
                          {isSubmittingRemark && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Previous Remarks */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaCommentAlt className="text-blue-500" />
                  <span className="text-base lg:text-lg font-semibold">
                    Previous Remarks ({remarks.length})
                  </span>
                </div>

                <div className="space-y-4 w-full lg:w-[80%]">
                  {remarks.length === 0 ? (
                    <div className="text-gray-500 text-center py-8 text-sm lg:text-base">
                      No remarks yet. Be the first to add one!
                    </div>
                  ) : (
                    remarks.map((remark, index) => {
                      const isEditing = editingId === remark.id;

                      return (
                        <div
                          key={remark.id}
                          className="bg-gray-50 p-3 lg:p-4 rounded-lg border space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-400">
                            <span>
                              Remark by{" "}
                              <span className="text-gray-700 font-semibold capitalize">
                                {remark.username}
                              </span>
                            </span>
                            <span>{formatDate(remark.created_at)}</span>
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                className="w-full border p-2 rounded text-sm"
                                rows={3}
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSave(remark.id)}
                                  className="text-white bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1 rounded"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-gray-600 hover:text-gray-800 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {remark.remark_type === "audio" ? (
                                <div className="space-y-2">
                                  {remark.audio_url && (
                                    <div className="w-full overflow-hidden">
                                      <AudioPlayer
                                        audioUrl={remark.audio_url}
                                        duration={remark.audio_duration}
                                        mimeType={remark.mimeType}
                                      />
                                    </div>
                                  )}
                                  <p className="text-gray-600 text-sm break-words">
                                    {remark.remark}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-gray-800 text-sm lg:text-base break-words">
                                  {remark.remark}
                                </p>
                              )}

                              {/* Show Edit button if user has permission */}
                              {remark.isEditable && !isEditing && (

                                <>
                                <button
                                  onClick={() => {
                                    setEditingId(remark.id);
                                    setEditedText(remark.remark);
                                  }}
                                  className="text-gray-500 hover:text-blue-600 text-sm flex items-center gap-1 mt-1"
                                  title="Edit Remark"
                                >
                                  <FaPencilAlt className="text-xs" />
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteRemark(remark.id);
                                  }}
                                  className="text-gray-500 hover:text-blue-600 text-sm flex items-center gap-1 mt-1"
                                  title="delete Remark"
                                >
                                  <FaTrash className="text-xs" />
                                </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Cover Image */}
          <div className="w-full lg:w-[280px] flex flex-col gap-4">
            <label className="text-base lg:text-lg font-semibold flex items-center gap-2">
              Cover Image
            </label>
            {!data?.cover_image ? (
              <label className="border-2 border-dashed border-indigo-300 rounded-md bg-gray-50 flex flex-col items-center justify-center h-48 lg:h-52 text-center px-4 py-6 text-gray-500 cursor-pointer transition">
                <p className="mt-1 font-medium text-gray-600 text-sm lg:text-base">
                  Upload cover image
                </p>
              </label>
            ) : (
              <div className="w-full h-48 lg:h-auto lg:flex-1">
                <img
                  src={data?.cover_image}
                  alt="cover preview"
                  className="w-full h-full lg:max-h-[460px] object-cover rounded-lg border border-indigo-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* Product Images Section */}
        <div>
          <div className="w-full p-4 lg:p-6">
            <div className="text-base lg:text-lg font-semibold mb-4 flex items-center gap-2">
              <span>Product Images</span>
            </div>

            {data?.images?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
                {data?.images.map((img, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    // onClick={() => openModal(img)}
                  >
                    <img
                      src={img.image}
                      alt={`Product Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 lg:h-52 text-center px-4 py-6 text-gray-500">
                <p className="text-sm lg:text-base">No images found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {/* {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-full max-h-full">
            <button
              className="absolute top-2 right-2 lg:top-4 lg:right-4 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center hover:bg-opacity-75 text-lg lg:text-xl z-10"
              onClick={closeModal}
            >
              <FaTimes />
            </button>
            <img
              src={selectedImage.image}
              alt="Enlarged product"
              className="max-w-[50%] max-h-[50%] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )} */}
    </div>
  );
}

export default ProductDetail;
