import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import {
  FaQrcode,
  FaCommentAlt,
  FaKeyboard,
  FaMicrophone,
} from "react-icons/fa";
import { Edit } from "lucide-react";
import VoiceRecorder from "../Remarks/VoiceRecorder";
import AudioPlayer from "../Remarks/AudioPlayer";

const API_BASE_URL = "http://shivam-mac.local:8000/api/v1.0/qr";

function ProductDetail() {
  const { code } = useParams();

  const [data, setData] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [newRemark, setNewRemark] = useState("");
  const [showRemarkForm, setShowRemarkForm] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [remarkType, setRemarkType] = useState("text");
  const [remarks, setRemarks] = useState([]);
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);
  const [remarkError, setRemarkError] = useState(null);

  const getProductDetail = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products/${code}/`);
      if (res.status === 200) {
        const productData = res?.data?.data;
        setData(productData);
      }
      console.log("Product data:", res.data.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  // Get remarks for the product
  const getRemarks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/remarks/${code}/`);
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

      const payload = {
        remark_type: "text",
        remark: remarkText,
        product_code: code,
      };

      const res = await axios.post(`${API_BASE_URL}/remarks/${code}/`, payload);

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

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("remark_type", "voice");
      formData.append(
        "remark",
        remarkText ||
          `Voice note (${Math.floor(audioData.duration / 60)}:${(
            audioData.duration % 60
          )
            .toString()
            .padStart(2, "0")})`
      );
      formData.append("product_code", code);

      // Convert blob to file and append
      const audioFile = new File(
        [audioData.audioBlob],
        `voice_remark_${Date.now()}.webm`,
        {
          type: audioData.mimeType || "audio/webm",
        }
      );
      formData.append("audio_file", audioFile);

      const res = await axios.post(
        `${API_BASE_URL}/remarks/${code}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
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

  // console.log({ data });

  const openModal = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

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
    if (type === "voice") {
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
    <div className="">
      <main className="flex gap-4 flex-col">
        <div className="flex gap-8 justify-start">
          {/* Left Side: Product Info */}
          <div className="flex flex-1 flex-col gap-6 p-8 bg-white rounded-md shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h1 className=" text-3xl text-[#1e293b] font-bold">
                {data.name}
              </h1>

              <div className="flex items-center gap-4">
                <button
                  className="inline-flex items-center justify-center gap-2 bg-[#3b82f6] text-white px-4 py-2 rounded-md shadow-md cursor-pointer transition-all duration-300"
                  // onClick={}
                >
                  <FaQrcode color="blue" />
                  <span>Download QR Code</span>
                </button>

                <button className="inline-flex items-center justify-center gap-2 bg-[#3b82f6] text-white px-4 py-2 rounded-md shadow-md cursor-pointer transition-all duration-300">
                  <Edit color="blue" />
                  <span>Edit Product</span>
                </button>
              </div>
            </div>

            <div className="flex justify-start items-center gap-4">
              <div className="flex flex-col gap-2">
                <div className="info-label">DEPARTMENT</div>
                <div className="inline-flex items-center gap-2 bg-[#f8fafc] text-[#374151] px-4 py-2 rounded-md border border-[#e2e8f0]">
                  {/* <FaBuilding color="blue" /> */}
                  <span>
                    {!data?.belongs_to_department ? (
                      <span>N/A</span>
                    ) : (
                      <span>{data?.belongs_to_department}</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="info-label">QUANTITY</div>
                <div className="inline-flex items-center gap-2 bg-[#f8fafc] text-[#374151] px-4 py-2 rounded-md border border-[#e2e8f0]">
                  {/* <FaWarehouse color="blue" /> */}
                  <span>
                    {!data?.quantity ? (
                      <span>N/A</span>
                    ) : (
                      <span>{data?.quantity} Items</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="info-label">LOCATION</div>
                <div className="inline-flex items-center gap-2 bg-[#f8fafc] text-[#374151] px-4 py-2 rounded-md border border-[#e2e8f0]">
                  {/* <FaMapMarkerAlt color="blue" /> */}
                  {!data?.location ? (
                    <span>N/A</span>
                  ) : (
                    <span>{data?.location}</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              {/* Error Message */}
              {remarkError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {remarkError}
                </div>
              )}

              {!showRemarkForm ? (
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    onClick={() => handleShowRemarkForm("text")}
                    disabled={isSubmittingRemark}
                  >
                    <FaKeyboard className="w-4 h-4" />
                    <span>Add Text Remark</span>
                  </button>

                  <button
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    onClick={() => handleShowRemarkForm("voice")}
                    disabled={isSubmittingRemark}
                  >
                    <FaMicrophone className="w-4 h-4" />
                    <span>Add Voice Remark</span>
                  </button>
                </div>
              ) : (
                // <div className="remark-form">
                //   <textarea
                //     value={newRemark}
                //     onChange={(e) => setNewRemark(e.target.value)}
                //     placeholder="Write your remark here..."
                //     className="remark-textarea"
                //   />
                //   <div className="remark-form-buttons">
                //     <button
                //       className="remark-submit-btn"
                //       onClick={handleAddRemark}
                //     >
                //       Submit
                //     </button>
                //     <button
                //       className="remark-cancel-btn"
                //       onClick={() => {
                //         setShowRemarkForm(false);
                //         setNewRemark("");
                //       }}
                //     >
                //       Cancel
                //     </button>
                //   </div>
                // </div>

                <div className="space-y-4">
                  {showVoiceRecorder ? (
                    <div className="w-[60%]">
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
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="4"
                        disabled={isSubmittingRemark}
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                          onClick={handleCancelRemark}
                          disabled={isSubmittingRemark}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
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

              {/* <div className="remarks-title">
                <FaCommentAlt color="blue" />
                <span>Previous Remarks</span>
              </div>
              <div className="remarks-list md:w-[60%]">
                {remarks.map((remark, index) => (
                  <div key={index} className="remarks-content">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>
                        Remark by{" "}
                        <span className="text-gray-700 font-semibold">
                          {remark.created_by}
                        </span>
                      </span>{" "}
                      <span>{remark.created_at}</span>
                    </div>
                    <p>{remark.remark}</p>
                  </div>
                ))}
              </div> */}

              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaCommentAlt className="text-blue-500" />
                  <span className="text-lg font-semibold">
                    Previous Remarks ({remarks.length})
                  </span>
                </div>

                <div className="space-y-4 md:w-[80%]">
                  {remarks.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      No remarks yet. Be the first to add one!
                    </div>
                  ) : (
                    remarks.map((remark) => (
                      <div
                        key={remark.id}
                        className="bg-gray-50 p-2 rounded-lg border space-y-2"
                      >
                        {/* <div className="flex items-start justify-between mb-2"> */}
                        {/* <div className="flex items-center gap-2">
                          {remark.type === "voice" ? (
                            <FaMicrophone className="text-green-500 w-4 h-4" />
                          ) : (
                            <FaCommentAlt className="text-blue-500 w-4 h-4" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {remark.type === "voice"
                              ? "Voice Remark"
                              : "Text Remark"}
                          </span>
                        </div> */}
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>
                            Remark by{" "}
                            <span className="text-gray-700 font-semibold capitalize">
                              {remark.username}
                            </span>
                          </span>{" "}
                          <span>{formatDate(remark.created_at)}</span>
                        </div>
                        {/* </div> */}

                        {remark.type === "voice" ? (
                          <div className="space-y-2">
                            {remark.audioUrl && (
                              <AudioPlayer
                                audioUrl={remark.audioUrl}
                                duration={remark.duration}
                                mimeType={remark.mimeType}
                              />
                            )}
                            <p className="text-gray-600 text-sm">
                              {remark.remark}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-800">{remark.remark}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Cover Images */}
          <div className="flex w-[20%] flex-col gap-4">
            <label className="text-lg font-semibold flex items-center gap-2">
              Cover Image
            </label>
            {!data?.cover_image ? (
              <label className="border-2 border-dashed border-indigo-300 rounded-md bg-gray-50 flex flex-col items-center justify-center h-52 text-center px-4 py-6 text-gray-500 cursor-pointer transition">
                {/* <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
                <span className="text-3xl font-bold text-gray-400">+</span> */}
                <p className="mt-1 font-medium text-gray-600">
                  Upload cover image
                </p>
              </label>
            ) : (
              <div className="w-full flex-1">
                <img
                  src={data?.cover_image}
                  alt="cover preview"
                  className="w-full h-full max-h-max object-cover rounded-lg border border-indigo-200"
                />
                {/* <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
                >
                  ×
                </button> */}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Product Images */}
        <div className="flex">
          <div className="w-full p-6">
            <div className="text-lg font-semibold mb-4 flex items-center gap-2">
              {/* <FaImages color="blue" /> */}
              <span>Product Images</span>
            </div>
            {/* <div className="image-grid"> */}
            {data?.images?.length > 0 ? (
              <div className="image-grid">
                {data?.images.map((src, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => openModal(src)}
                  >
                    <img
                      src={src}
                      alt={`Product Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-52 text-center px-4 py-6 text-gray-500">
                <p>No images found</p>
              </div>
            )}
            {/* </div> */}
          </div>
        </div>
      </main>
      {/* {selectedImage && (
        <div className="image-modal" onClick={closeModal}>
          <button className="image-modal-close" onClick={closeModal}>
            <FaTimes />
          </button>
          <img
            src={selectedImage}
            alt="Enlarged product"
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )} */}
    </div>
  );
}

export default ProductDetail;
