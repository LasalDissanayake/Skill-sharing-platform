import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';
import { API_BASE_URL } from '../../config/apiConfig';
import DefaultCover from '../../assets/p.png';
import DefaultAvatar from '../../assets/avatar.png';
import { storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../common/Navbar';
import { useToast } from '../common/Toast';

const Profile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    skills: []
  });
  const [error, setError] = useState(null);
  const [imageUpload, setImageUpload] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followData, setFollowData] = useState([]);
  const [isLoadingFollowData, setIsLoadingFollowData] = useState(false);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(true);

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
          firstName: data.firstName || '',
          lastName: data.lastName || '',
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
          firstName: mockUser.firstName || '',
          lastName: mockUser.lastName || '',
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
      addToast('Failed to upload image. Please try again.', 'error');
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
          return; // Toast message already displayed in handleImageUpload
        }
      }
      
      const updateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        bio: editForm.bio,
        skills: editForm.skills,
        profilePicture: profilePictureUrl
      };
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
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
      
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Failed to update profile. Please try again.', 'error');
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

  // Add a function to fetch follower/following details
  const fetchFollowData = async (type) => {
    setIsLoadingFollowData(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${type}/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`);
      }

      const data = await response.json();
      setFollowData(data);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      // Mock data for development
      setFollowData([
        { id: '1', username: 'user1', profilePicture: null },
        { id: '2', username: 'user2', profilePicture: null },
      ]);
    } finally {
      setIsLoadingFollowData(false);
    }
  };

  // Function to handle showing the followers modal
  const handleShowFollowers = () => {
    fetchFollowData('followers');
    setShowFollowersModal(true);
  };

  // Function to handle showing the following modal
  const handleShowFollowing = () => {
    fetchFollowData('following');
    setShowFollowingModal(true);
  };

  // Function to follow/unfollow a user
  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      
      const response = await fetch(`${API_BASE_URL}/users/${endpoint}/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${endpoint} user`);
      }

      // Refresh follow data
      const type = showFollowersModal ? 'followers' : 'following';
      fetchFollowData(type);
      
      // Update the followData state immediately for better UX
      setFollowData(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isFollowing: !isFollowing } 
            : user
        )
      );
      
      addToast(
        isFollowing ? 'Successfully unfollowed user' : 'Successfully followed user', 
        'success'
      );
    } catch (error) {
      console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} user:`, error);
      addToast(error.message || `Failed to ${isFollowing ? 'unfollow' : 'follow'} user. Please try again.`, 'error');
    }
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
                <h1 className="text-3xl font-bold text-ExtraDarkColor mb-1 sm:mb-0">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.firstName || user.lastName || user.username}
                </h1>
                <span className="sm:ml-4 px-3 py-1 text-xs inline-flex items-center rounded-full bg-DarkColor text-white font-medium">
                  {user.role}
                </span>
              </div>
              <p className="text-gray-600 mt-1 text-sm flex items-center">
                <i className='bx bx-user mr-1'></i> @{user.username}
              </p>
              <p className="text-gray-600 mt-1 text-sm flex items-center">
                <i className='bx bx-envelope mr-1'></i> {user.email}
              </p>
              <div className="mt-3 flex space-x-4">
                <button 
                  onClick={handleShowFollowers}
                  className="flex items-center text-sm text-gray-700 hover:text-DarkColor transition-colors"
                >
                  <i className='bx bx-user-plus text-DarkColor'></i>
                  <span className="ml-1 font-medium">{user.followers ? user.followers.length : 0} Followers</span>
                </button>
                <button 
                  onClick={handleShowFollowing}
                  className="flex items-center text-sm text-gray-700 hover:text-DarkColor transition-colors"
                >
                  <i className='bx bx-user-check text-DarkColor'></i>
                  <span className="ml-1 font-medium">{user.following ? user.following.length : 0} Following</span>
                </button>
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
              {!isCurrentUserProfile && (
                <button 
                  onClick={() => navigate(`/messages/${user.id}`)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow-sm flex items-center"
                >
                  <i className='bx bx-message-square-detail mr-1'></i> Message
                </button>
              )}
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
                
                {/* Personal information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editForm.firstName || ''}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor focus:border-DarkColor transition-colors"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editForm.lastName || ''}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor focus:border-DarkColor transition-colors"
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                
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

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-ExtraDarkColor">Followers</h3>
              <button 
                onClick={() => setShowFollowersModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className='bx bx-x text-2xl'></i>
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {isLoadingFollowData ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-DarkColor"></div>
                </div>
              ) : followData.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {followData.map(follower => (
                    <li key={follower.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img 
                            src={follower.profilePicture || DefaultAvatar} 
                            alt={follower.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className="ml-3">
                            <p className="font-medium text-gray-800">
                              {follower.firstName && follower.lastName 
                                ? `${follower.firstName} ${follower.lastName}`
                                : follower.firstName || follower.lastName || follower.username}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            follower.isFollowing 
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                              : 'bg-DarkColor text-white hover:bg-ExtraDarkColor'
                          }`}
                          onClick={() => handleFollowToggle(follower.id, follower.isFollowing)}
                        >
                          {follower.isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No followers yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-ExtraDarkColor">Following</h3>
              <button 
                onClick={() => setShowFollowingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className='bx bx-x text-2xl'></i>
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {isLoadingFollowData ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-DarkColor"></div>
                </div>
              ) : followData.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {followData.map(following => (
                    <li key={following.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img 
                            src={following.profilePicture || DefaultAvatar} 
                            alt={following.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className="ml-3">
                            <p className="font-medium text-gray-800">
                              {following.firstName && following.lastName 
                                ? `${following.firstName} ${following.lastName}`
                                : following.firstName || following.lastName || following.username}
                            </p>
                          </div>
                        </div>
                        <button 
                          className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                          onClick={() => handleFollowToggle(following.id, true)}
                        >
                          Unfollow
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Not following anyone yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
