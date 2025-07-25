import React from "react";

const ProductDetail = () => {
  const prodCode = window.location.href.split("prod_code=")[1];

  return <div>{`ProductDetail-${prodCode}`}</div>;
};

export default ProductDetail;
