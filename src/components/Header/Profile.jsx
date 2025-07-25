import React from 'react'
import { FaUser } from 'react-icons/fa'

const Profile = () => {
  return (
    <div className="flex items-center">
      {/* Profile Section - Fixed hover background overflow */}
      <div className="flex flex-col items-center cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-all duration-200 group overflow-hidden">
        {/* User Icon */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
          <FaUser className="w-5 h-5 text-white" />
        </div>
        
        {/* My Profile Text */}
        <div className="mt-1">
          <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-200 whitespace-nowrap">My Profile</p>
        </div>
      </div>
    </div>
  )
}

export default Profile
