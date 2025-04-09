import React from 'react';
import DefaultAvatar from '../../../assets/avatar.png';

const PostsTab = ({
  isCurrentUserProfile,
  user,
  currentUser,
  setShowPostModal,
  postFileInputRef,
  isLoadingPosts,
  posts,
  formatPostDate,
  handleLikePost
}) => {
  return (
    <div className="space-y-6">
      {isCurrentUserProfile && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow mb-6">
          <div className="flex items-center space-x-3">
            <img
              src={user?.profilePicture || DefaultAvatar}
              alt={user?.username}
              className="h-10 w-10 rounded-full object-cover"
            />
            <button
              onClick={() => setShowPostModal(true)}
              className="bg-white text-gray-500 w-full text-left px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50"
            >
              What's on your mind?
            </button>
          </div>

          <div className="flex mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                setShowPostModal(true);
                setTimeout(() => postFileInputRef.current?.click(), 100);
              }}
              className="flex-1 flex justify-center items-center text-gray-500 py-1 hover:bg-gray-100 rounded-md"
            >
              <i className='bx bx-image text-green-500 text-xl mr-2'></i> Photo/Video
            </button>
          </div>
        </div>
      )}

      {isLoadingPosts ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-DarkColor"></div>
          <p className="mt-2 text-gray-500">Loading posts...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-3">
                <img
                  src={post.authorProfilePicture || DefaultAvatar}
                  alt={post.authorUsername}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-800">
                    {post.authorFirstName && post.authorLastName
                      ? `${post.authorFirstName} ${post.authorLastName}`
                      : post.authorFirstName || post.authorLastName || post.authorUsername}
                  </p>
                  <p className="text-xs text-gray-500">{formatPostDate(post.createdAt)}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
              </div>

              {post.mediaUrl && (
                <div className="mb-3 rounded-lg overflow-hidden">
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

              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <button 
                  className={`flex items-center ${
                    post.likes && currentUser && post.likes.includes(currentUser.id) 
                      ? 'text-blue-500 font-medium' 
                      : 'text-gray-500 hover:text-DarkColor'
                  }`}
                  onClick={() => handleLikePost(post.id)}
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
                <button className="flex items-center text-gray-500 hover:text-DarkColor">
                  <i className='bx bx-share mr-1'></i> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <i className='bx bx-message-square-add text-5xl text-gray-400 mb-3'></i>
          <p className="text-gray-600 mb-4">No posts yet. {isCurrentUserProfile ? 'Share your knowledge!' : 'This user has not posted anything yet.'}</p>
          {isCurrentUserProfile && (
            <button
              onClick={() => setShowPostModal(true)}
              className="px-5 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor transition-colors shadow-sm inline-flex items-center"
            >
              <i className='bx bx-plus mr-2'></i> Create Post
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostsTab;
