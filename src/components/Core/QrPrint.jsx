import React, { useState, useRef } from "react";

const inchToPx = (inch) => `${inch * 96}px`; // 96 DPI

const totalRows = 17;
const qrPerRow = 5;

const QRSheetUploader = () => {
  const [imageURLs, setImageURLs] = useState([]);
  const printRef = useRef();
const fileInputRef = useRef();
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
    files.map((file) =>
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
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; font-family: sans-serif; }
          .page {
            width: ${inchToPx(8.27)};
            height: ${inchToPx(11.69)};
            padding: ${inchToPx(0.625)} ${inchToPx(0.3125)};
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
          }
          .row {
            display: flex;
            margin-bottom: ${inchToPx(0.4)};
          }
          .cell {
            width: ${inchToPx(1)};
            height: ${inchToPx(1)};
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 10px;
            border: 1px dashed #999;
            box-sizing: border-box;
          }
          .cell img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .gap {
            width: ${inchToPx(0.5)};
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
      <div className=" onprint" style={{ margin: "20px" }}>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleUpload}
        />
        <button onClick={handlePrint} style={{ marginLeft: "10px" }}>
          Print QR Sheet
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
          .onprint { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default QRSheetUploader;
