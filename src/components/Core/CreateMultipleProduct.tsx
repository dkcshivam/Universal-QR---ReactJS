import React, { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

// A type for our product object
type ProductRow = {
  id: number;
  name: string;
  location: string;
  department: string;
  image: string;
};

function CreateMultipleProduct() {
  const createNewProductRow = (): ProductRow => ({
    id: Date.now() + Math.random(), // Simple unique ID for the row
    name: '',
    location: '',
    department: '',
    image: '',
  });

  const [productRows, setProductRows] = useState<ProductRow[]>([createNewProductRow()]);

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const updatedRows = [...productRows];
    updatedRows[index] = { ...updatedRows[index], [name]: value };
    setProductRows(updatedRows);
  };

  const handleAddRow = () => {
    setProductRows([...productRows, createNewProductRow()]);
  };

  const handleRemoveRow = (index: number) => {
    if (productRows.length > 1) {
      const updatedRows = productRows.filter((_, i) => i !== index);
      setProductRows(updatedRows);
    }
  };

  const handleSaveAll = () => {
    // Basic validation: check if any name field is empty
    const isValid = productRows.every(product => product.name.trim() !== '');
    if (!isValid) {
      alert('Please fill in at least the name for all products.');
      return;
    }
    
    console.log('Saving the following products:', productRows);
    // Here you would typically send the data to your backend API
    alert(`${productRows.length} products saved successfully! (Check the console)`);
    // Optional: reset the form after saving
    setProductRows([createNewProductRow()]);
  };

  return (
    <div className="product-table-container">
      <div className="table-header">
        <h1>Create Multiple Products</h1>
        <button 
          className="save-all-btn" 
          onClick={handleSaveAll}
        >
          Save All Products
        </button>
      </div>
      <table className="create-product-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Location</th>
            <th>Department</th>
            <th>Image URL</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {productRows.map((row, index) => (
            <tr key={row.id}>
              <td>
                <input
                  type="text"
                  name="name"
                  value={row.name}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="e.g., Premium Leather Jacket"
                  className="form-input"
                />
              </td>
              <td>
                <input
                  type="text"
                  name="location"
                  value={row.location}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="e.g., Factory"
                  className="form-input"
                />
              </td>
              <td>
                <input
                  type="text"
                  name="department"
                  value={row.department}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="e.g., HARD GOODS"
                  className="form-input"
                />
              </td>
              <td>
                <input
                  type="text"
                  name="image"
                  value={row.image}
                  onChange={(e) => handleInputChange(index, e)}
                  placeholder="e.g., https://image.url/jacket.png"
                  className="form-input"
                />
              </td>
              <td>
                <button 
                  className="remove-row-btn"
                  onClick={() => handleRemoveRow(index)}
                  disabled={productRows.length <= 1}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-row-btn" onClick={handleAddRow}>
        <FaPlus /> Add Another Product
      </button>
    </div>
  );
}

export default CreateMultipleProduct;