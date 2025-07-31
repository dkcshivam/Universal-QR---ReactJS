import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";

const Loader = ({ size = 120 }) => {
  const [spinnerData, setSpinnerData] = useState(null);

  useEffect(() => {
    fetch("/lottie-spinner.json")
      .then((res) => res.json())
      .then((data) => setSpinnerData(data));
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {spinnerData && (
        <Lottie animationData={spinnerData} style={{ width: size, height: size }} />
      )}
    </div>
  );
};

export default Loader;