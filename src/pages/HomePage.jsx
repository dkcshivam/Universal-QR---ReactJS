import SearchFilter from "../components/Core/Filter";
import ProductGrid from "../components/Core/Product/ProductDisplay";
import { useState, useEffect } from "react";
import axios from "axios";

const HomePage = ({ activeTab, setActiveTab }) => {


  return (
    <div>
      <SearchFilter activeTab={activeTab} setActiveTab={setActiveTab} />
      <ProductGrid activeTab={activeTab} />
    </div>
  );
};

export default HomePage;
