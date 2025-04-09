import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';
import DefaultAvatar from '../../assets/avatar.png';
import { useToast } from './Toast';

const CommentSection = ({ post, currentUser, formatTime, onCommentAdded }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const updatedPost = await response.json();
      setNewComment('');
      setShowComments(true);
      
      if (onCommentAdded) {
        onCommentAdded(updatedPost);
      }
      
      addToast('Comment added successfully!', 'success');
    } catch (error) {
      console.error('Error adding comment:', error);
      addToast('Failed to add comment. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  return (
    <div className="mt-2">
      <div 
        className="flex items-center cursor-pointer py-2 text-gray-500 hover:text-DarkColor"
        onClick={toggleComments}
      >
        <i className={`bx ${showComments ? 'bx-chevron-up' : 'bx-chevron-down'} mr-2`}></i>
        <span>{post.comments?.length || 0} Comments</span>
      </div>
      
      {showComments && (
        <div className="mt-2 space-y-3">
          {/* Comment form */}
          <form onSubmit={handleSubmitComment} className="flex space-x-2">
            <img 
              src={currentUser?.profilePicture || DefaultAvatar} 
              alt={currentUser?.username}
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-3 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-DarkColor"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-DarkColor disabled:text-gray-400"
              >
                {isSubmitting ? (
                  <i className='bx bx-loader-alt animate-spin'></i>
                ) : (
                  <i className='bx bx-send'></i>
                )}
              </button>
            </div>
          </form>
          
          {/* Comments list */}
          <div className="space-y-3">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2 group">
                  <img 
                    src={comment.userProfilePicture || DefaultAvatar} 
                    alt={comment.username}
                    className="h-8 w-8 rounded-full object-cover cursor-pointer"
                    onClick={() => handleUserClick(comment.userId)}
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 px-3 py-2 rounded-lg">
                      <p 
                        className="font-medium text-sm text-gray-800 cursor-pointer hover:underline"
                        onClick={() => handleUserClick(comment.userId)}
                      >
                        {comment.username}
                      </p>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-2">
                      {formatTime(comment.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
