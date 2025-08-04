import React, { useState } from "react";
import CreateMultipleProduct from "./CreateMultipleProduct";
import PrintableTable from "./blukprintsetup"; // The QR rendering component

const ProductFlow = () => {
  const [exampleData, setExampleData] = useState([]);
  const [showQR, setShowQR] = useState(false);

  const handleSubmit = (products) => {
    console.log("Products submitted:", products);
    setExampleData(products);
    setShowQR(true);
  };

  return (
    <div>
      {!showQR ? (
        <CreateMultipleProduct />
      ) : (
        <PrintableTable exampleData={exampleData} />
      )}
    </div>
  );
};

export default ProductFlow;
