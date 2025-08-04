import React, { useRef } from "react";

const QRSheetExample = ({ exampleData }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Product QR Table</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              font-family: 'Segoe UI', sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
              margin-top: 10px;
            }
            thead {
              background-color: #f2f2f2;
            }
            th, td {
              border: 1px solid #999;
              padding: 8px;
              text-align: center;
              vertical-align: middle;
            }
            tbody tr:nth-child(odd) {
              background-color: #fafafa;
            }
            img {
              width: 60px;
              height: 60px;
              object-fit: contain;
              border-radius: 6px;
            }
            h2 {
              text-align: center;
              margin: 0;
              padding: 10px 0;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <h2>Product QR Table</h2>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div>
      <div className="onprint" style={{ margin: "20px" }}>
        <button
          onClick={handlePrint}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Print Product Table
        </button>
      </div>

      <div ref={printRef} style={{ padding: "20px" }}>
        <table>
          <thead>
            <tr>
              <th>Product Name*</th>
              <th>Code</th>
              <th>Cover Image</th>
              <th>QR Image</th>
            </tr>
          </thead>
          <tbody>
            {exampleData && exampleData.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.product_code}</td>
                <td>
                  {item.qr_link && (
                    <img
                      src={typeof item.qr_link === "string"
                        ? `http://localhost:8000/` + item.qr_link
                        : URL.createObjectURL(item.qr_link)}
                      alt="Cover"
                    />
                  )}
                </td>
                <td>
                  {item.qr_link && (
                    <img
                      src={typeof item.qr_link === "string"
                        ? `http://localhost:8000/` + item.qr_link
                        : URL.createObjectURL(item.qr_link)}
                      alt="Cover"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          .onprint {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default QRSheetExample;
