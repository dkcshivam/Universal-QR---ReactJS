import React, { useState } from 'react';
import {
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaEdit
} from 'react-icons/fa';

const Profile = ({ isMobile, onClose }) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    console.log('Logging out...');
    if (onClose) onClose();
  };

  const handleSettingsClick = () => {
    setShowSettings((prev) => !prev);
  };

  const handleEditProfile = () => {
    console.log('Edit profile...');
    if (onClose) onClose();
  };

  if (isMobile) {
    return (
      <div className="flex flex-col items-center space-y-6 py-4">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg mb-4">
            <FaUser className="w-12 h-12" />
          </div>
        </div>

        <div className="w-full pt-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-red-600 group border border-red-200"
          >
            <FaSignOutAlt className="h-5 w-5 group-hover:text-red-700 transition-colors" />
            <span className="font-semibold group-hover:text-red-700 transition-colors">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* User icon button */}
      <button
        onClick={handleSettingsClick}
        className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-sm">
          <FaUser className="w-6 h-6" />
        </div>
      </button>

      {/* Dropdown */}
      {showSettings && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Just 'My Profile' label */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">My Profile</p>
          </div>

          <div className="p-2">
            <button
              onClick={handleEditProfile}
              className="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <FaEdit className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">Edit Profile</span>
            </button>

            <button className="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-50 rounded transition-colors">
              <FaCog className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">Settings</span>
            </button>

            <button className="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-50 rounded transition-colors">
              <FaBell className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">Notifications</span>
            </button>

            <hr className="my-2" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-2 text-left hover:bg-red-50 rounded transition-colors text-red-600"
            >
              <FaSignOutAlt className="h-4 w-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
