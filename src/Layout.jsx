import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Header at the top */}

      <Header />

      <main className="flex-grow mx-0 py-4 px-0 sm:px-16 mt-12 sm:mt-auto">
        <Outlet />
      </main>



      <footer className="bg-gray-100 mt-4">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} My App. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
