import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import MobileFooter from "./components/Footer/MobileFooter";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      {/* Header at the top */}
      <Header />

      {/* main content */}
      <main className="flex-grow w-full py-2 px-4 sm:py-4 box-border sm:px-16">
        <Outlet />
      </main>

      {/* footer */}
      <footer className="bg-gray-100 mt-4 hidden md:block">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} My App. All rights reserved.
        </div>
      </footer>

      {/* Mobile Footer - only on mobile */}
      <MobileFooter />
    </div>
  );
};

export default Layout;
