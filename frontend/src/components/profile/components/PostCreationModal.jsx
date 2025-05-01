import React, { useState, useEffect } from 'react';
import DefaultAvatar from '../../../assets/avatar.png';
import { lockScroll, unlockScroll } from '../../../utils/scrollLock';

const PostCreationModal = ({
  isOpen,
  onClose,
  user,
  postContent,
  setPostContent,
  postMedia,
  postMediaPreview,
  setPostMedia,
  setPostMediaPreview,
  isSubmittingPost,
  handleCreatePost,
  postFileInputRef
}) => {
  useEffect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
    
    return () => {
      if (isOpen) {
        unlockScroll();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Create Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="bx bx-x text-2xl"></i>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex items-center mb-4">
              <img
                src={user?.profilePicture || DefaultAvatar}
                alt={user?.username || 'User'}
                className="h-10 w-10 rounded-full object-cover mr-3"
              />
              <div>
                <p className="font-medium text-gray-800">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username}
                </p>
              </div>
            </div>
            
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-DarkColor"
              placeholder="What's on your mind?"
              rows="4"
            ></textarea>
            
            {postMediaPreview && (
              <div className="relative">
                {postMedia?.type.startsWith('image') ? (
                  <img
                    src={postMediaPreview}
                    alt="Preview"
                    className="w-full max-h-[50vh] object-contain rounded-lg"
                  />
                ) : (
                  <video
                    src={postMediaPreview}
                    controls
                    className="w-full max-h-[50vh] object-contain rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPostMedia(null);
                    setPostMediaPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full"
                >
                  <i className="bx bx-x text-xl"></i>
                </button>
              </div>
            )}
          </form>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div>
            <input
              type="file"
              ref={postFileInputRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPostMedia(file);
                  const previewUrl = URL.createObjectURL(file);
                  setPostMediaPreview(previewUrl);
                }
              }}
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => postFileInputRef.current?.click()}
              className="flex items-center text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-md"
            >
              <i className="bx bx-image text-green-500 text-xl mr-1"></i>
              {postMediaPreview ? 'Change Media' : 'Add Media'}
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              disabled={isSubmittingPost}
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePost}
              disabled={isSubmittingPost || (!postContent.trim() && !postMedia)}
              className={`px-4 py-2 rounded-lg flex items-center ${
                isSubmittingPost || (!postContent.trim() && !postMedia)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-DarkColor text-white hover:bg-ExtraDarkColor'
              }`}
            >
              {isSubmittingPost ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Posting...
                </>
              ) : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCreationModal;