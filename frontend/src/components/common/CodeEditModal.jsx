import React, { useState, useEffect } from 'react';
import DefaultAvatar from '../../assets/avatar.png';

const CodeEditModal = ({
  isOpen,
  onClose,
  user,
  post,
  handleUpdateCodePost,
  isSubmitting
}) => {
  const [codeContent, setCodeContent] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  
  useEffect(() => {
    if (post) {
      setCodeContent(post.content || '');
      setCodeLanguage(post.codeLanguage || 'javascript');
    }
  }, [post]);
  
  if (!isOpen || !post) return null;
  
  const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'php', label: 'PHP' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' }
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateCodePost(post.id, codeContent, codeLanguage);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-ExtraDarkColor">Update Code Post</h3>
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
                src={user?.profilePicture || DefaultAvatar}
                alt={user?.username}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-800">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || user?.lastName || user?.username}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="codeLanguage">
                Programming Language
              </label>
              <select
                id="codeLanguage"
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor focus:border-DarkColor"
              >
                {languageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="codeContent">
                Code Snippet
              </label>
              <textarea
                id="codeContent"
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-DarkColor focus:border-DarkColor"
                rows="10"
                placeholder="// Enter your code here..."
              ></textarea>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !codeContent.trim()}
              className={`px-4 py-2 rounded-lg ${
                isSubmitting || !codeContent.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-DarkColor text-white hover:bg-ExtraDarkColor'
              } transition-colors`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </div>
              ) : 'Update Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CodeEditModal; 