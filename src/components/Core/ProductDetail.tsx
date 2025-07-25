import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import {
  FaBuilding,
  FaWarehouse,
  FaMapMarkerAlt,
  FaQrcode,
  FaPlus,
  FaCommentAlt,
  FaImages,
  FaTimes,
} from "react-icons/fa";

function ProductDetail() {
  const { code } = useParams();

  const [data, setData] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [newRemark, setNewRemark] = useState("");
  const [showRemarkForm, setShowRemarkForm] = useState(false);
  const [remarks, setRemarks] = useState([
    {
      text: "Handcrafted Italian leather shoes. Available in multiple sizes. Premium comfort guarantee.",
      author: "Sarah Johnson",
      date: new Date().toLocaleDateString(),
    },
  ]);

  const getProductDetail = async () => {
    try {
      const { data } = await axios.get(
        `http://shivam-mac.local:8000/api/v1.0/qr/products/${code}/`
      );
      if ((data.status = 200)) {
        setData(data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProductDetail();
  }, [code]);

  const openModal = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleAddRemark = () => {
    if (newRemark.trim()) {
      const newRemarkObj = {
        text: newRemark.trim(),
        author: "You", // Could be replaced with actual user name
        date: new Date().toLocaleDateString(),
      };
      setRemarks([newRemarkObj, ...remarks]);
      setNewRemark("");
      setShowRemarkForm(false);
    }
  };

  // Dummy data to populate the fields, matching the image
  const product = {
    name: "Italian Leather Loafers",
    department: "Production",
    quantity: 12,
    location: "Showroom",
    remarks:
      "Handcrafted Italian leather shoes. Available in multiple sizes. Premium comfort guarantee.",
    author: "Sarah Johnson",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=120&h=120&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=120&h=120&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop",
    ],
  };

  return (
    <div className="page-container">
      <main className="main-content">
        <div className="product-name-header">
          <h1 className="product-name">{product.name}</h1>
        </div>

        <div className="product-layout">
          {/* Left Side: Product Info */}
          <div className="product-info">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">DEPARTMENT</div>
                <div className="info-value">
                  <FaBuilding color="blue" />
                  <span>{product.department}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">QUANTITY</div>
                <div className="info-value">
                  <FaWarehouse color="blue" />
                  <span>{product.quantity} Items</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">LOCATION</div>
                <div className="info-value">
                  <FaMapMarkerAlt color="blue" />
                  <span>{product.location}</span>
                </div>
              </div>
            </div>

            <button className="download-qr-btn">
              <FaQrcode color="blue" />
              <span>Download QR Code</span>
            </button>

            <div>
              {!showRemarkForm ? (
                <button
                  className="add-remark-btn"
                  onClick={() => setShowRemarkForm(true)}
                >
                  <FaPlus color="blue" />
                  <span>Add Remark</span>
                </button>
              ) : (
                <div className="remark-form">
                  <textarea
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    placeholder="Write your remark here..."
                    className="remark-textarea"
                  />
                  <div className="remark-form-buttons">
                    <button
                      className="remark-submit-btn"
                      onClick={handleAddRemark}
                    >
                      Submit
                    </button>
                    <button
                      className="remark-cancel-btn"
                      onClick={() => {
                        setShowRemarkForm(false);
                        setNewRemark("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="remarks-title">
                <FaCommentAlt color="blue" />
                <span>Previous Remarks</span>
              </div>
              <div className="remarks-list">
                {remarks.map((remark, index) => (
                  <div key={index} className="remarks-content">
                    <p>{remark.text}</p>
                    <div className="remarks-author">
                      Added by {remark.author} on {remark.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Product Images */}
          <div className="product-image-section">
            <div className="image-grid-container">
              <div className="image-grid-title">
                <FaImages color="blue" />
                <span>Product Images</span>
              </div>
              <div className="image-grid">
                {product.images.map((src, index) => (
                  <div
                    key={index}
                    className="image-grid-item"
                    onClick={() => openModal(src)}
                  >
                    <img src={src} alt={`Product Image ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      {selectedImage && (
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
      )}
    </div>
  );
}

export default ProductDetail;
