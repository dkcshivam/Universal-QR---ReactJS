import SearchFilter from "../components/Core/Filter";
import ProductGrid from "../components/Core/Product/ProductDisplay";

const HomePage = ({ activeTab }) => {
  return (
    <div>
      <SearchFilter />
      <ProductGrid activeTab={activeTab} />
    </div>
  );
};

export default HomePage;
