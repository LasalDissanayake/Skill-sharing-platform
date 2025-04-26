import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../../config/apiConfig';
import DefaultAvatar from '../../assets/avatar.png';
import { useToast } from '../common/Toast';
import { storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import CodePostEditor from './CodePostEditor';

const EditPostModal = ({
  isOpen,
  onClose,
  post,
  onPostUpdate,
  currentUser
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const mediaInputRef = useRef(null);
  const { addToast } = useToast();
  
  // Code post fields
  const [code, setCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeTitle, setCodeTitle] = useState('');
  const [isCodePost, setIsCodePost] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      if (post.mediaUrl) {
        setMediaPreview(post.mediaUrl);
      }
      
      // Set code post fields if applicable
      setCode(post.code || '');
      setCodeLanguage(post.codeLanguage || 'javascript');
      setCodeTitle(post.codeTitle || '');
      setIsCodePost(post.isCodePost || false);
    }
  }, [post]);

  const handleRemoveMedia = () => {
    setMedia(null);
    setMediaPreview(null);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate based on post type
    if (isCodePost) {
      if (!code.trim() || !codeTitle.trim()) {
        addToast('Please add both code and title for your code post', 'error');
        return;
      }
    } else if (!content.trim() && !media && !mediaPreview) {
      addToast('Please add some content or media to your post', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // First, upload media if there is new media
      let mediaUrl = post.mediaUrl;
      let mediaType = post.mediaType;

      if (media) {
        try {
          // Use Firebase storage for upload
          const mediaName = `post_${currentUser.id}_${Date.now()}_${media.name}`;
          const storageRef = ref(storage, `postMedia/${mediaName}`);

          await uploadBytes(storageRef, media);
          mediaUrl = await getDownloadURL(storageRef);
          mediaType = media.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';
        } catch (uploadError) {
          console.error('Error uploading media:', uploadError);
          throw new Error('Failed to upload media');
        }
      } else if (mediaPreview === null && post.mediaUrl) {
        // If media preview is null but post had media, user removed media
        mediaUrl = null;
        mediaType = null;
      }
      
      // Prepare request body based on post type
      const requestBody = {
        content,
        mediaUrl,
        mediaType
      };
      
      // Add code post fields if this is a code post
      if (isCodePost) {
        requestBody.code = code;
        requestBody.codeLanguage = codeLanguage;
        requestBody.codeTitle = codeTitle;
        requestBody.isCodePost = true;
      } else {
        // Explicitly set code fields to null if switching from code post to regular post
        requestBody.code = null;
        requestBody.codeLanguage = null;
        requestBody.codeTitle = null;
        requestBody.isCodePost = false;
      }
      
      // Then update the post
      const response = await fetch(`${API_BASE_URL}/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to update post';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If the response is not valid JSON
          if (response.status === 403) {
            errorMessage = 'You are not authorized to update this post. Only the author can edit posts.';
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      addToast('Post updated successfully!', 'success');
      
      if (onPostUpdate) {
        onPostUpdate(data.post);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      addToast(error.message || 'Failed to update post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-ExtraDarkColor">
            {isCodePost ? 'Edit Code Post' : 'Edit Post'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className='bx bx-x text-2xl'></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="flex items-center mb-4">
              <img
                src={currentUser?.profilePicture || DefaultAvatar}
                alt={currentUser?.username}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-800">
                  {currentUser?.firstName && currentUser?.lastName
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : currentUser?.firstName || currentUser?.lastName || currentUser?.username}
                </p>
              </div>
            </div>
            
            {/* Post Type Toggle - Only if it wasn't a code post already */}
            {!post.isCodePost && (
              <div className="mb-4 flex">
                <button
                  type="button"
                  onClick={() => setIsCodePost(false)}
                  className={`flex-1 py-2 px-4 ${!isCodePost ? 'bg-DarkColor text-white' : 'bg-gray-200 text-gray-700'} rounded-l-md transition-colors`}
                >
                  Regular Post
                </button>
                <button
                  type="button"
                  onClick={() => setIsCodePost(true)}
                  className={`flex-1 py-2 px-4 ${isCodePost ? 'bg-DarkColor text-white' : 'bg-gray-200 text-gray-700'} rounded-r-md transition-colors`}
                >
                  Code Post
                </button>
              </div>
            )}
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor focus:border-DarkColor transition-colors mb-4"
              rows="5"
              placeholder={isCodePost ? "Add a description for your code (optional)" : "What's on your mind?"}
            ></textarea>
            
            {isCodePost && (
              <div className="mb-4">
                <CodePostEditor 
                  code={code}
                  codeLanguage={codeLanguage}
                  codeTitle={codeTitle}
                  onCodeChange={setCode}
                  onLanguageChange={setCodeLanguage}
                  onTitleChange={setCodeTitle}
                />
              </div>
            )}
            
            {!isCodePost && mediaPreview && (
              <div className="relative mt-4">
                {mediaPreview.includes('video') || post.mediaType === 'VIDEO' ? (
                  <video 
                    src={mediaPreview} 
                    className="mt-2 rounded-lg max-h-60 max-w-full" 
                    controls
                  />
                ) : (
                  <img 
                    src={mediaPreview} 
                    alt="Preview" 
                    className="mt-2 rounded-lg max-h-60 max-w-full"
                  />
                )}
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100"
                >
                  <i className='bx bx-x text-xl'></i>
                </button>
              </div>
            )}
            
            {!isCodePost && (
              <div className="flex items-center mt-4 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  className="flex items-center text-gray-600 hover:text-DarkColor"
                >
                  <i className='bx bx-image text-xl mr-2'></i>
                  <span>Add Photo/Video</span>
                </button>
                <input
                  type="file"
                  hidden
                  ref={mediaInputRef}
                  onChange={handleMediaChange}
                  accept="image/*,video/*"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end p-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor"
              disabled={isSubmitting || (isCodePost && (!code.trim() || !codeTitle.trim()))}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal; 