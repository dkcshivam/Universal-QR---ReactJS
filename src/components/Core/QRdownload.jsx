import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Sample product data based on your image

const productGrid = [
  {
    id: 1,
    product_code: "100000000103",
    name: "Designer Silk Evening Dress",
    quantity: '10',
    location: "Showroom",
    department: "PRODUCTION",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=150&h=100&fit=crop",
  },
  {
    id: 2,
    product_code: "100000000002",
    name: "Luxury Leather Handbag",
    quantity: '20',
    location: "Inventory",
    department: "SAMPLING",
    image: "https://images.unsplash.com/photo-1579338908476-3a3a1d7193e0?w=150&h=100&fit=crop",
  },
  {
    id: 3,
    product_code: "100000000003",
    name: "Swiss Automatic Watch",
    quantity: '13',
    location: "Hard Goods",
    department: "TECH",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=150&h=100&fit=crop",
  },
  {
    id: 4,
    product_code: "100000000004",
    name: "Italian Leather Loafers",
    quantity: '5',
    location: "Showroom",
    department: "PRODUCTION",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=100&fit=crop",
  },
  {
    id: 5,
    product_code: "100000000005",
    name: "Premium Leather Jacket",
    quantity: '8',
    location: "Factory",
    department: "HARD GOODS",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150&h=100&fit=crop",
  },
  {
    id: 6,
    product_code: "100000000006",
    name: "iPhone 15 Pro Max",
    quantity: '15',
    location: "Hard Goods",
    department: "TECH",
    image: "https://images.unsplash.com/photo-1695026149383-49769a1f7243?w=150&h=100&fit=crop",
  },
  {
    id: 7,
    product_code: "100000000007",
    name: "Couture Evening Gown",
    quantity: '7',
    location: "Inventory",
    department: "SAMPLING",
    image: "https://images.unsplash.com/photo-1598190910533-69b990b43b44?w=150&h=100&fit=crop",
  },
  {
    id: 8,
    product_code: "100000000008",
    name: "Wireless Noise Cancelling Headphones",
    quantity: '25',
    location: "Hard Goods",
    department: "TECH",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=100&fit=crop",
  },
];

function QRdownload() {
  const [selectedProducts, setSelectedProducts] = useState(new Set());

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
      toast("Please select at least one product to download QR codes.");
      return;
    }

    // Map selected IDs to product codes
    const selectedCodes = Array.from(selectedProducts)
      .map(id => productGrid.find(p => p.id === id)?.product_code)
      .filter(Boolean); // Remove undefined if any

    const payload = {
      product_codes: selectedCodes,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/qr/bulk-qr-download/`,
        payload,
        {
          responseType: 'blob',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const blob = response.data;
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "QR_Codes.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("QR codes downloaded successfully!") ; 

    } catch (error) {
      console.log("handle download error: ", error);
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="">
      <div className="table-header">
        <h1>Product List</h1>
        <button
          className="download-selected-btn"
          onClick={handleDownload}
          disabled={selectedProducts.size === 0}
        >
          Download QR for Selected ({selectedProducts.size})
        </button>
      </div>
      <table className="product-table">
        <thead>
          <tr>
            <th></th>
            <th>Image</th>
            <th>Product Name</th>
            <th>Quantity</th>
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
                  className="cursor-pointer"
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
              <td>{product.quantity}</td>
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
