import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import QRCode from "qrcode";


const totalRows = 17;
const qrPerRow = 1;

const QRSheetUploader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [imageURLs, setImageURLs] = useState([]);
  const [totalSelected, setTotalSelected] = useState(0);
  const printRef = useRef();
  const fileInputRef = useRef();

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
              width: 4in;
              height: 2in;
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
      width: 4in;
      height: 1.9in;
      display: flex;
      align-items: center;
      justify-content: center;
    }
            .cell img {
            padding : 0px;
      width: 90%;
      height: 90%;
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
    </div>
  );
};

export default QRSheetUploader;
