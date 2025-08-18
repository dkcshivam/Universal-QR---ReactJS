import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import MobileFooter from "./components/Footer/MobileFooter";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const Layout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      {/* Header at the top */}

      {pathname === "/login" ? "" : <Header />}

      {/* main content */}
      <main className="flex-grow w-full py-2 px-4 sm:py-4 box-border sm:px-16">
        <Outlet />
      </main>

      {/* footer */}
      <footer className="bg-gray-100 mt-4 hidden md:block">
        <div className="flex  justify-between items-center max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Universal QR. All rights reserved.
        <button className="inline-flex  items-center gap-2 px-2 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded shadow-sm font-semibold text-sm lg:text-base cursor-pointer transition-all duration-200 " onClick={() => navigate("/print-qr")}>Print QRCode</button>

        </div>
      </footer>

      {/* Mobile Footer - only on mobile */}

      {pathname === "/login" ? "" : <MobileFooter />}
    </div>
  );
};

export default Layout;
