import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';
import { API_BASE_URL } from '../../config/apiConfig';
import DefaultCover from '../../assets/p.jpg';
import DefaultAvatar from '../../assets/avatar.png';
import { storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../common/Navbar';

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
  const [imageUpload, setImageUpload] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUpload(file);
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageUpload = async () => {
    if (!imageUpload) return null;
    
    try {
      setIsUploading(true);
      // Create a unique path for the image
      const imageName = `${user.id}_${Date.now()}_${imageUpload.name}`;
      const storageRef = ref(storage, `profileImages/${imageName}`);
      
      // Upload the image
      await uploadBytes(storageRef, imageUpload);
      
      // Get the URL of the uploaded image
      const url = await getDownloadURL(storageRef);
      setIsUploading(false);
      
      // Return the URL to be saved in MongoDB
      return url;
    } catch (error) {
      console.error("Error uploading image: ", error);
      setIsUploading(false);
      return null;
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      // Upload image if one was selected
      let profilePictureUrl = user.profilePicture;
      if (imageUpload) {
        profilePictureUrl = await handleImageUpload();
        if (!profilePictureUrl) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: editForm.bio,
          skills: editForm.skills,
          profilePicture: profilePictureUrl
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      // Reset image upload state
      setImageUpload(null);
      setImagePreview(null);
      
      alert('Profile updated successfully!');
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

  // Add a function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
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
    <div className="min-h-screen bg-gray-50">
      {/* Use the reusable Navbar component */}
      <Navbar user={user} />

      {/* Profile Header with Enhanced Cover Image */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-7xl mx-auto mt-6">
        <div className="h-80 overflow-hidden relative">
          <img 
            className="w-full object-cover h-full object-center transform hover:scale-105 transition-transform duration-500" 
            src={DefaultCover} 
            alt="Cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        </div>
        
        {/* Profile Information Section - Redesigned */}
        <div className="relative px-6 pb-6">
          {/* Profile Picture */}
          <div className="absolute -top-20 left-6 sm:left-8 z-20">
            <div className="h-40 w-40 rounded-xl border-4 border-white shadow-xl overflow-hidden group relative">
              <img 
                className="h-full w-full object-cover"
                src={imagePreview || user.profilePicture || DefaultAvatar}
                alt={user.username} 
              />
              {isEditing && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <i className='bx bx-camera text-3xl text-white'></i>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden"
                  />
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <div className="w-16 h-16 border-4 border-t-4 border-DarkColor rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
          
          {/* User Info and Actions */}
          <div className="ml-0 sm:ml-48 pt-24 sm:pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold text-ExtraDarkColor mb-1 sm:mb-0">{user.username}</h1>
                <span className="sm:ml-4 px-3 py-1 text-xs inline-flex items-center rounded-full bg-DarkColor text-white font-medium">
                  {user.role}
                </span>
              </div>
              <p className="text-gray-600 mt-1 text-sm flex items-center">
                <i className='bx bx-envelope mr-1'></i> {user.email}
              </p>
              <div className="mt-3 flex space-x-4">
                <div className="flex items-center text-sm text-gray-700">
                  <i className='bx bx-user-plus text-DarkColor'></i>
                  <span className="ml-1 font-medium">{user.followers?.size || 0} Followers</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <i className='bx bx-user-check text-DarkColor'></i>
                  <span className="ml-1 font-medium">{user.following?.size || 0} Following</span>
                </div>
              </div>
            </div>
            
            {/* Profile Actions */}
            <div className="mt-4 sm:mt-0 flex space-x-2">
              {isEditing ? (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center"
                >
                  <i className='bx bx-edit mr-1'></i> Edit Profile
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-DarkColor text-white rounded-lg hover:bg-ExtraDarkColor transition-colors shadow-sm flex items-center"
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
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ExtraDarkColor mb-4 flex items-center">
              <i className='bx bx-user-circle mr-2'></i>About
            </h2>
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Only show this when editing on mobile, since we have the hover effect on desktop */}
                <div className="md:hidden mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <i className='bx bx-camera mr-2'></i> 
                    {imageUpload ? 'Change Image' : 'Upload Image'}
                  </button>
                  {imagePreview && (
                    <div className="mt-2 relative h-24 w-24 mx-auto">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-full w-full object-cover rounded-lg" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageUpload(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
                      >
                        <i className='bx bx-x'></i>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Other form fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor focus:border-DarkColor transition-colors"
                    rows="4"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={editForm.skills.join(', ')}
                    onChange={handleSkillChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor focus:border-DarkColor transition-colors"
                    placeholder="JavaScript, React, etc."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor transition-colors shadow-sm flex items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className='bx bx-save mr-1'></i> Save Changes
                    </>
                  )}
                </button>
              </form>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 leading-relaxed">{user.bio || 'No bio provided yet.'}</p>
                </div>
                <h3 className="text-md font-semibold text-ExtraDarkColor mb-2 flex items-center">
                  <i className='bx bx-code-alt mr-2'></i>Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-gray-100 text-DarkColor rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
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
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'posts'
                      ? 'border-DarkColor text-DarkColor'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className='bx bx-message-square-detail mr-2 text-lg'></i>
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('learning')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'learning'
                      ? 'border-DarkColor text-DarkColor'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className='bx bx-book-open mr-2 text-lg'></i>
                  Learning
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'achievements'
                      ? 'border-DarkColor text-DarkColor'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className='bx bx-trophy mr-2 text-lg'></i>
                  Achievements
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'posts' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <i className='bx bx-message-square-add text-5xl text-gray-400 mb-3'></i>
                    <p className="text-gray-600 mb-4">No posts yet. Share your knowledge!</p>
                    <button 
                      onClick={() => navigate('/p')}
                      className="px-5 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor transition-colors shadow-sm inline-flex items-center"
                    >
                      <i className='bx bx-plus mr-2'></i> Create Post
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'learning' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <i className='bx bx-book text-5xl text-gray-400 mb-3'></i>
                    <p className="text-gray-600 mb-4">You haven't started any learning plans yet.</p>
                    <button className="px-5 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor transition-colors shadow-sm inline-flex items-center">
                      <i className='bx bx-plus mr-2'></i> Browse Learning Plans
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <i className='bx bx-medal text-5xl text-gray-400 mb-3'></i>
                    <p className="text-gray-600 mb-4">Complete learning tasks to earn achievements!</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mt-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 opacity-50">
                        <i className='bx bx-star text-3xl text-yellow-500 mb-2'></i>
                        <p className="text-sm font-medium">First Post</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 opacity-50">
                        <i className='bx bx-badge-check text-3xl text-blue-500 mb-2'></i>
                        <p className="text-sm font-medium">Profile Complete</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 opacity-50">
                        <i className='bx bx-like text-3xl text-green-500 mb-2'></i>
                        <p className="text-sm font-medium">First Like</p>
                      </div>
                    </div>
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
