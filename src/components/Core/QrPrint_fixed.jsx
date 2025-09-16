import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import QRCode from "qrcode";
import axios from "axios";



const qrPerRow = 1;

const QRSheetUploader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [imageURLs, setImageURLs] = useState([]);
  const [totalSelected, setTotalSelected] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef();
  const fileInputRef = useRef();
const totalRows = imageURLs.length;
  // Get data from navigation state
  useEffect(() => {
    if (location.state) {
      const { selectedProducts: products, totalSelected: total } = location.state;
      if (products && products.length > 0) {
        let qrimages = products.map(prod => prod.qr);
        setImageURLs(qrimages);
        setTotalSelected(total);
      }
    } else {
      toast.info("No products selected. Please go back and select products to print.");
    }
  }, [location.state]);

  // Generate QR codes for selected products
 


  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Reset input manually so same file selection can re-trigger
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }

    files.sort((a, b) => {
      const aNum = parseInt(a.name.match(/\d+/)?.[0] || "0", 10);
      const bNum = parseInt(b.name.match(/\d+/)?.[0] || "0", 10);
      return aNum - bNum;
    });

    const urls = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      )
    );

    setImageURLs(urls);
  };

  const handleRegularizeQR = async () => {


    setIsLoading(true);
    
    try {
       const token = localStorage.getItem("access_token");
      const response = await axios.post(`${BASE_URL}/qr/update-qr-codes/`, {start_date:selectedDate}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

      const data = await response.data;
      
      if (response.status === 200) {
        toast.success("QR codes regularized successfully!");
        setShowModal(false);
      } else {
        toast.error(data.message || "Failed to regularize QR codes");
      }
    } catch (error) {
      console.error("Error regularizing QR codes:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Sheet</title>
          <style>
            @page {  margin: 0; }
            body { margin: 0; padding: 0; font-family: sans-serif; }
            .page {
              width: 3.93701in;
              height: 1.9685in;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
            }
            .row {
              display: flex;
      flex-direction: row;
      // height: 2in;
            }
               .cell {
      width: 3.93701in;
      height: 1.9685in;
      display: flex;
      align-items: center;
      justify-content: center;
    }
            .cell img {
            padding : 0px;
      width: 99%;
      height: 100%;
      // object-fit: contain;
    }
    .gap {
      // width: 0.3in;
      // height: 2in;
    }
          </style>
        </head>
        <body onload="window.__triggerPrint && window.__triggerPrint()">
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for all images to load before printing
    printWindow.__triggerPrint = () => {
      const images = printWindow.document.images;
      if (images.length === 0) {
        printWindow.print();
        printWindow.close();
      } else {
        let loaded = 0;
        for (let img of images) {
          if (img.complete) {
            loaded++;
          } else {
            img.onload = img.onerror = () => {
              loaded++;
              if (loaded === images.length) {
                printWindow.print();
                printWindow.close();
              }
            };
          }
        }
        if (loaded === images.length) {
          printWindow.print();
          printWindow.close();
        }
      }
    };
  };

  return (
    <div>
      <div className="no-print" style={{ margin: "20px" }}>
        {/* Navigation and Info */}
        <div style={{ marginBottom: "20px" }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              marginRight: "10px", 
              padding: "8px 16px",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            ← Back
          </button>

        </div>

        {/* Manual Upload Option */}
        <div style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleUpload}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ 
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: "#059669",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Regularize QR
        </button>
        <button 
          onClick={handlePrint} 
          style={{ 
            padding: "10px 20px",
            backgroundColor: "#059669",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
          disabled={imageURLs.length === 0}
        >
          Print QR Sheet ({imageURLs.length} QR codes)
        </button>



      </div>

      <div className="page" ref={printRef}>
        {Array.from({ length: totalRows }).map((_, rowIdx) => (
          <div className="row" key={rowIdx}>
            {Array.from({ length: qrPerRow }).map((_, colIdx) => {
              const idx = rowIdx * qrPerRow + colIdx;
              return (
                <React.Fragment key={`cell-${rowIdx}-${colIdx}`}>
                  <div className="cell">
                    {imageURLs[idx] && (
                      <img src={imageURLs[idx]} alt={`QR ${idx + 1}`} />
                    )}
                  </div>
                  {colIdx < qrPerRow - 1 && <div className="gap" />}
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>

      {/* Hide upload controls when printing */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Regularize QR Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            width: "400px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}>
            <h2 style={{ marginTop: 0 }}>Regularize QR</h2>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Select Date:</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "16px"
                }}
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginRight: "10px",
                  padding: "10px 15px",
                  backgroundColor: "#f3f4f6",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRegularizeQR}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                {isLoading ? "Processing..." : "Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRSheetUploader;
