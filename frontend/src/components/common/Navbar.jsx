import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';
import DefaultAvatar from '../../assets/avatar.png';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span 
              className="text-ExtraDarkColor text-xl font-bold cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              SkillShare
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => navigate('/dashboard')}
              title="Dashboard"
            >
              <i className='bx bxs-home text-xl text-DarkColor'></i>
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Notifications"
            >
              <i className='bx bx-bell text-xl text-DarkColor'></i>
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Messages"
            >
              <i className='bx bx-message-square-detail text-xl text-DarkColor'></i>
            </button>
            <div className="relative ml-3">
              <div>
                <button 
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-DarkColor"
                  onClick={() => navigate('/profile')}
                  title="Profile"
                >
                  <img 
                    className="h-8 w-8 rounded-full object-cover border-2 border-DarkColor"
                    src={user?.profilePicture || DefaultAvatar} 
                    alt={user?.username || 'User'}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
