import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            Your Company
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
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
