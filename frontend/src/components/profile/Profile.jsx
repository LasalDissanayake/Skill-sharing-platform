import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';
import { API_BASE_URL } from '../../config/apiConfig';
import DefaultCover from '../../assets/p.jpg';
import DefaultAvatar from '../../assets/avatar.png';

const Profile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    skills: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/auth');
            return;
          }
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        console.log('User profile data:', data);
        setUser(data);
        setEditForm({
          bio: data.bio || '',
          skills: data.skills || []
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again later.');
        
        // Fallback to mock data for development purposes
        const mockUser = {
          id: '1',
          username: 'demo_user',
          email: 'demo@example.com',
          role: 'PROFESSIONAL',
          skills: ['JavaScript', 'React', 'Spring Boot'],
          bio: 'This is mock data because the API connection failed.',
          profilePicture: null,
          followers: new Set(),
          following: new Set()
        };
        
        setUser(mockUser);
        setEditForm({
          bio: mockUser.bio,
          skills: mockUser.skills
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: editForm.bio,
          skills: editForm.skills
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleSkillChange = (e) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
    setEditForm({
      ...editForm,
      skills: skillsArray
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-PrimaryColor">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DarkColor"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-PrimaryColor">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl text-red-600 font-semibold mb-4">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-PrimaryColor">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-ExtraDarkColor text-xl font-bold">SkillShare</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => navigate('/dashboard')}
              >
                <i className='bx bxs-home text-xl text-DarkColor'></i>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <i className='bx bx-bell text-xl text-DarkColor'></i>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <i className='bx bx-message-square-detail text-xl text-DarkColor'></i>
              </button>
              <div className="relative ml-3">
                <div>
                  <button className="flex text-sm rounded-full focus:outline-none">
                    <img 
                      className="h-8 w-8 rounded-full object-cover border-2 border-DarkColor"
                      src={user.profilePicture || DefaultAvatar} 
                      alt={user.username}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden max-w-7xl mx-auto mt-6">
        <div className="h-64 overflow-hidden relative">
          <img 
            className="w-full object-cover h-full" 
            src={DefaultCover} 
            alt="Cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        <div className="relative flex flex-col sm:flex-row px-6 -mt-16 sm:-mt-24 pb-6">
          <div className="z-10 self-start sm:self-center">
            <img 
              className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg" 
              src={user.profilePicture || DefaultAvatar}
              alt={user.username} 
            />
          </div>
          <div className="mt-6 sm:mt-0 sm:ml-6 flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-ExtraDarkColor">{user.username}</h1>
                <span className="ml-3 px-2 py-1 text-xs rounded-full bg-DarkColor text-white">{user.role}</span>
              </div>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <div className="mt-2 flex space-x-4">
                <div className="flex items-center">
                  <i className='bx bx-user-plus text-DarkColor'></i>
                  <span className="ml-1">{user.followers?.size || 0} Followers</span>
                </div>
                <div className="flex items-center">
                  <i className='bx bx-user-check text-DarkColor'></i>
                  <span className="ml-1">{user.following?.size || 0} Following</span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              {isEditing ? (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <i className='bx bx-edit mr-1'></i> Edit Profile
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor"
              >
                <i className='bx bx-log-out mr-1'></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
        {/* Left Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ExtraDarkColor mb-4">About</h2>
            {isEditing ? (
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-DarkColor focus:border-DarkColor"
                    rows="4"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={editForm.skills.join(', ')}
                    onChange={handleSkillChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-DarkColor focus:border-DarkColor"
                    placeholder="JavaScript, React, etc."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <>
                <p className="text-gray-600 mb-4">{user.bio || 'No bio provided yet.'}</p>
                <h3 className="text-md font-semibold text-ExtraDarkColor mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-gray-100 text-DarkColor rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No skills added yet.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2">
          {/* Tabs */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'posts'
                      ? 'border-DarkColor text-DarkColor'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className='bx bx-message-square-detail mr-2'></i>
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('learning')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'learning'
                      ? 'border-DarkColor text-DarkColor'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className='bx bx-book-open mr-2'></i>
                  Learning
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'achievements'
                      ? 'border-DarkColor text-DarkColor'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className='bx bx-trophy mr-2'></i>
                  Achievements
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'posts' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <i className='bx bx-message-square-add text-4xl text-gray-400 mb-2'></i>
                    <p className="text-gray-500">No posts yet. Share your knowledge!</p>
                    <button 
                      onClick={() => navigate('/p')}
                      className="mt-3 px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor inline-flex items-center"
                    >
                      <i className='bx bx-plus mr-2'></i> Create Post
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'learning' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <i className='bx bx-book text-4xl text-gray-400 mb-2'></i>
                    <p className="text-gray-500">You haven't started any learning plans yet.</p>
                    <button className="mt-3 px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor inline-flex items-center">
                      <i className='bx bx-plus mr-2'></i> Browse Learning Plans
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <i className='bx bx-medal text-4xl text-gray-400 mb-2'></i>
                    <p className="text-gray-500">Complete learning tasks to earn achievements!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white mt-12 py-6 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2023 SkillShare Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
