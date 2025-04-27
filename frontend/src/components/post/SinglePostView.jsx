import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';
import DefaultAvatar from '../../assets/avatar.png';
import Navbar from '../common/Navbar';
import CommentSection from '../common/CommentSection';
import { useToast } from '../common/Toast';
import CodeExecutor from '../common/CodeExecutor';
import CodeEditModal from '../common/CodeEditModal';

const SinglePostView = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile');
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }

        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Handle post update (e.g., after adding a comment)
  const handlePostUpdated = (updatedPost) => {
    setPost(updatedPost);
  };

  // Format post date
  const formatPostDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString();
  };

  // Handle like post
  const handleLikePost = async () => {
    if (!post) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const data = await response.json();
      
      // Update post likes in state
      setPost(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          likes: data.liked 
            ? [...(prev.likes || []), currentUser.id] 
            : (prev.likes || []).filter(id => id !== currentUser.id)
        };
      });
    } catch (error) {
      console.error('Error liking post:', error);
      addToast('Failed to like post', 'error');
    }
  };

  // Handle updating a code post
  const handleUpdateCodePost = async (postId, codeContent, codeLanguage) => {
    if (!codeContent.trim()) {
      addToast('Please add some code to your post', 'error');
      return;
    }

    setIsSubmittingEdit(true);

    try {
      const token = localStorage.getItem('token');

      const postData = {
        content: codeContent,
        isCodePost: true,
        codeLanguage: codeLanguage
      };

      const response = await fetch(`${API_BASE_URL}/posts/${postId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error('Failed to update code post');
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      setShowEditModal(false);
      addToast('Code post updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating code post:', error);
      addToast('Failed to update code post. Please try again.', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navbar user={currentUser} />
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DarkColor"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div>
        <Navbar user={currentUser} />
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl text-red-600 font-semibold mb-4">Error</h2>
            <p>{error || 'Post not found'}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={currentUser} />
      
      <div className="max-w-3xl mx-auto my-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Post Author */}
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <img 
                src={post.authorProfilePicture || DefaultAvatar} 
                alt={post.authorUsername}
                className="h-10 w-10 rounded-full object-cover cursor-pointer"
                onClick={() => navigate(`/profile/${post.authorId}`)}
              />
              <div className="ml-3">
                <p 
                  className="font-medium text-gray-800 cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${post.authorId}`)}
                >
                  {post.authorFirstName && post.authorLastName
                    ? `${post.authorFirstName} ${post.authorLastName}`
                    : post.authorFirstName || post.authorLastName || post.authorUsername}
                </p>
                <p className="text-xs text-gray-500">{formatPostDate(post.createdAt)}</p>
              </div>
            </div>
            
            {/* Edit button - only shown for the post author if it's a code post */}
            {currentUser && currentUser.id === post.authorId && post.isCodePost && (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center"
              >
                <i className='bx bx-edit mr-1'></i> Edit Code
              </button>
            )}
          </div>
          
          {/* Post Content */}
          {post.isCodePost ? (
            <CodeExecutor code={post.content} language={post.codeLanguage || 'javascript'} />
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
              </div>
              
              {/* Post Media */}
              {post.mediaUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  {post.mediaType === 'IMAGE' ? (
                    <img 
                      src={post.mediaUrl} 
                      alt="Post media" 
                      className="w-full h-auto"
                    />
                  ) : (
                    <video 
                      src={post.mediaUrl} 
                      controls 
                      className="w-full h-auto"
                    />
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Post Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <button 
              className={`flex items-center ${
                post.likes && currentUser && post.likes.includes(currentUser.id) 
                  ? 'text-blue-500 font-medium' 
                  : 'text-gray-500 hover:text-DarkColor'
              }`}
              onClick={handleLikePost}
            >
              <i className={`bx ${
                post.likes && currentUser && post.likes.includes(currentUser.id) 
                  ? 'bxs-like' 
                  : 'bx-like'
              } mr-1`}></i> {post.likes ? post.likes.length : 0} Likes
            </button>
            <button className="flex items-center text-gray-500 hover:text-DarkColor">
              <i className='bx bx-comment mr-1'></i> {post.comments?.length || 0} Comments
            </button>
          </div>
          
          {/* Comments Section */}
          <CommentSection 
            post={post}
            currentUser={currentUser}
            formatTime={formatPostDate}
            onCommentAdded={handlePostUpdated}
          />
        </div>
        
        <div className="mt-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-DarkColor"
          >
            <i className='bx bx-arrow-back mr-1'></i> Back
          </button>
        </div>
      </div>
      
      {/* Code Edit Modal */}
      <CodeEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={currentUser}
        post={post}
        handleUpdateCodePost={handleUpdateCodePost}
        isSubmitting={isSubmittingEdit}
      />
    </div>
  );
};

export default SinglePostView;
