import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';
import DefaultAvatar from '../../assets/avatar.png';
import Navbar from '../common/Navbar';
import CommentSection from '../common/CommentSection';
import SharePostModal from '../common/SharePostModal';
import EditPostModal from '../common/EditPostModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import CodePostDisplay from '../common/CodePostDisplay';

const SinglePostView = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

  const handleEditPost = () => {
    if (currentUser && post.authorId === currentUser.id) {
      setShowEditModal(true);
    } else {
      addToast('You can only edit posts that you created', 'error');
    }
  };

  const handlePostEdited = (updatedPost) => {
    if (updatedPost) {
      setPost(updatedPost);
      addToast('Post updated successfully', 'success');
    }
  };

  const handleDeletePost = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeletePost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        addToast('Post deleted successfully', 'success');
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        addToast(errorData.message || 'Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      addToast('An error occurred while deleting the post', 'error');
    } finally {
      setShowDeleteConfirm(false);
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
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <div className="text-center text-red-500 text-lg font-semibold">
              {error || 'Post not found'}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPostLiked = post.likes && post.likes.includes(currentUser?.id);

  return (
    <div>
      <Navbar user={currentUser} />
      
      <SharePostModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={post.id}
        currentUser={currentUser}
      />
      
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={post}
        onPostUpdate={handlePostEdited}
        currentUser={currentUser}
      />
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
      
      <div className="max-w-4xl mx-auto p-4 pt-20">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Post Header */}
          <div className="p-4 flex justify-between items-center border-b">
            <div className="flex items-center">
              <img
                src={post.authorProfilePicture || DefaultAvatar}
                alt={post.authorUsername}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <div className="font-medium text-gray-800">
                  {post.authorFirstName && post.authorLastName
                    ? `${post.authorFirstName} ${post.authorLastName}`
                    : post.authorUsername}
                </div>
                <div className="text-xs text-gray-500">
                  {formatPostDate(post.createdAt)}
                  {post.updatedAt !== post.createdAt && " (edited)"}
                </div>
              </div>
            </div>
            
            {/* Post Options */}
            {currentUser && post.authorId === currentUser.id && (
              <div className="relative">
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditPost}
                    className="text-gray-500 hover:text-DarkColor"
                  >
                    <i className='bx bx-edit-alt text-xl'></i>
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <i className='bx bx-trash text-xl'></i>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Post Content */}
          <div className="p-4">
            {post.content && (
              <p className="text-gray-800 mb-4 whitespace-pre-line">{post.content}</p>
            )}
            
            {/* Code Block Display */}
            {post.isCodePost && post.code && (
              <CodePostDisplay 
                code={post.code}
                language={post.codeLanguage || 'javascript'}
                title={post.codeTitle || 'Code Snippet'}
              />
            )}
            
            {/* Media Display */}
            {post.mediaUrl && !post.isCodePost && (
              <div className="my-2">
                {post.mediaType === 'IMAGE' ? (
                  <img
                    src={post.mediaUrl}
                    alt="Post media"
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="w-full h-auto rounded-lg"
                  />
                )}
              </div>
            )}
          </div>
          
          {/* Post Actions */}
          <div className="p-4 border-t border-b flex justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLikePost}
                className="flex items-center space-x-1"
              >
                <i className={`bx ${isPostLiked ? 'bxs-heart text-red-500' : 'bx-heart'} text-xl`}></i>
                <span>{post.likes ? post.likes.length : 0} Likes</span>
              </button>
              
              <button className="flex items-center space-x-1">
                <i className='bx bx-comment text-xl'></i>
                <span>{post.comments ? post.comments.length : 0} Comments</span>
              </button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center space-x-1"
              >
                <i className='bx bx-share text-xl'></i>
                <span>Share</span>
              </button>
            </div>
          </div>
          
          {/* Comments */}
          <CommentSection
            post={post}
            currentUser={currentUser}
            onPostUpdated={handlePostUpdated}
          />
        </div>
      </div>
    </div>
  );
};

export default SinglePostView;
