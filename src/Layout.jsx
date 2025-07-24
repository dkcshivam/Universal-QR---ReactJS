import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Header at the top */}

      <Header />

      {/* main content */}

      <main className="flex-grow mx-auto py-4 px-16">
        <Outlet />
      </main>

      {/* footer */}

      <footer className="bg-gray-100 mt-4">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} My App. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
