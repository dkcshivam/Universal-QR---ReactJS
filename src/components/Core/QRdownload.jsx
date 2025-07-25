import React, { useState } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";

// Sample product data based on your image
const productGrid = [
  {
    id: 1,
    name: "Designer Silk Evening Dress",
    location: "Showroom",
    department: "PRODUCTION",
    image:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=150&h=100&fit=crop",
  },
  {
    id: 2,
    name: "Luxury Leather Handbag",
    location: "Inventory",
    department: "SAMPLING",
    image:
      "https://images.unsplash.com/photo-1579338908476-3a3a1d7193e0?w=150&h=100&fit=crop",
  },
  {
    id: 3,
    name: "Swiss Automatic Watch",
    location: "Hard Goods",
    department: "TECH",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=150&h=100&fit=crop",
  },
  {
    id: 4,
    name: "Italian Leather Loafers",
    location: "Showroom",
    department: "PRODUCTION",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=100&fit=crop",
  },
  {
    id: 5,
    name: "Premium Leather Jacket",
    location: "Factory",
    department: "HARD GOODS",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150&h=100&fit=crop",
  },
  {
    id: 6,
    name: "iPhone 15 Pro Max",
    location: "Hard Goods",
    department: "TECH",
    image:
      "https://images.unsplash.com/photo-1695026149383-49769a1f7243?w=150&h=100&fit=crop",
  },
  {
    id: 7,
    name: "Couture Evening Gown",
    location: "Inventory",
    department: "SAMPLING",
    image:
      "https://images.unsplash.com/photo-1598190910533-69b990b43b44?w=150&h=100&fit=crop",
  },
  {
    id: 8,
    name: "Wireless Noise Cancelling Headphones",
    location: "Hard Goods",
    department: "TECH",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=100&fit=crop",
  },
];

function QRdownload() {
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allProductIds = new Set(productGrid.map((p) => p.id));
      setSelectedProducts(allProductIds);
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectOne = (productId) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleDownload = async () => {
    if (selectedProducts.size === 0) {
      alert("Please select at least one product to download QR codes.");
      return;
    }

    const zip = new JSZip();
    const qrCodePromises= [];

    selectedProducts.forEach((id) => {
      const product = productGrid.find((p) => p.id === id);
      const dummy = `{
        url: "https//:dkcexport.com",
        name: "shishpal",
        department: "shiping",
        quantity: 300,
        shipingdate: "20-06-2025",
      }`;
      
      if (product) {
        // The data to be encoded in the QR code. Could be a URL, product ID, etc.
        const qrData = dummy;

        const promise = QRCode.toDataURL(qrData).then((url) => {
          const base64Data = url.split(",")[1];
          zip.file(`${product.name.replace(/ /g, "_")}_QR.png`, base64Data, {
            base64: true,
          });
        });
        qrCodePromises.push(promise);
      }
    });

    await Promise.all(qrCodePromises);

    zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "QR_Codes.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="product-table-container">
      <div className="table-header">
        <h1>Product List</h1>
        <button
          className="download-selected-btn"
          onClick={handleDownload}
          disabled={selectedProducts.size === 0}
        >
          Download Selected ({selectedProducts.size})
        </button>
      </div>
      <table className="product-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  selectedProducts.size === productGrid.length &&
                  productGrid.length > 0
                }
              />
            </th>
            <th>Image</th>
            <th>Name</th>
            <th>Location</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {productGrid.map((product) => (
            <tr key={product.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => handleSelectOne(product.id)}
                />
              </td>
              <td>
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-table-img"
                />
              </td>
              <td>{product.name}</td>
              <td>{product.location}</td>
              <td>
                <span
                  className={`department-tag ${product.department
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {product.department}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QRdownload;
