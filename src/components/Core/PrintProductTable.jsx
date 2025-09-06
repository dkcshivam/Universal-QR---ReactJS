import React, { useState, useRef } from "react";

function PrintProductTableModal({ data,setPrintModal }) {
  const [open, setOpen] = useState(false);
  const printRef = useRef();

  // Function to print only the modal content
  const handlePrint = () => {
    const printContents = printRef.current.outerHTML; // 👈 instead of innerHTML
    const win = window.open("", "", "width=800,height=600");
    win.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          table { border-collapse: collapse; width: 100%; text-align: center; font-size: 14px; }
          th, td { border: 1px solid black; padding: 0px; }
          img {  object-fit: contain; }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `);
    win.document.close();

    // ✅ Wait for images to load before printing
    win.onload = function () {
      win.focus();
      win.print();
      win.close();
    };
  };

  return (
    <div className="p-6">
      {/* Open Modal Button */}

      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-[100%] max-w-4xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Print Preview</h2>
          </div>

          {/* Scrollable Content 👇 */}
          <div ref={printRef} className="flex-1 overflow-y-auto p-4">
            <table className="w-full border border-black border-collapse text-center text-sm">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className="border border-black px-2 py-1">
                    Product Code
                  </th>
                  <th className="border border-black px-2 py-1">Cover Image</th>
                  <th className="border border-black px-2 py-1">
                    Product Name
                  </th>
                  <th className="border border-black px-2 py-1">Quantity</th>
                  <th className="border border-black px-2 py-1">Location</th>

                  <th className="border border-black px-2 py-1">QR Code </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={index}
                    className="border border-black"
                    style={{ height: "2in" }}
                  >
                    <td className="border border-black px-2 py-2 text-[10px]">
                      {item.code}
                    </td>
                    <td
                      className="border border-black px-2 py-2"
                      style={{ width: "2in", height: "2in" }}
                    >
                      <img
                        src={item.cover_image}
                        alt=""
                        className="mx-auto"
                        style={{ width: "100%", height: "100%" }}
                      />
                    </td>
                    <td className="border border-black px-2 py-2">
                      {item.name}
                    </td>
                    <td className="border border-black px-2 py-2">
                      {item.quantity}
                    </td>
                    <td className="border border-black px-2 py-2">
                      {item.location}
                    </td>
                    <td
                      className="border border-black px-2 py-2 text-center"
                      style={{ width: "2in" }} // 👈 td width = 2 inch
                    >
                      {item.code}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t">
            <button
              onClick={() => setPrintModal(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Print
            </button>
          </div>
          {/* Footer */}
        </div>
      </div>
    </div>
  );
}

export default PrintProductTableModal;
