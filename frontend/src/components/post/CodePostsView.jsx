import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';
import DefaultAvatar from '../../assets/avatar.png';
import Navbar from '../common/Navbar';
import CodeExecutor from '../common/CodeExecutor';
import { useToast } from '../common/Toast';
import CodePostModal from '../common/CodePostModal';

const CodePostsView = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [codePosts, setCodePosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [showCodePostModal, setShowCodePostModal] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  
  const languageOptions = [
    { value: 'all', label: 'All Languages' },
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
        setUser(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile');
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  // Fetch code posts
  useEffect(() => {
    const fetchCodePosts = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const allPosts = await response.json();
        
        // Filter for code posts only
        const filteredPosts = allPosts.filter(post => post.isCodePost);
        setCodePosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching code posts:', error);
        setError('Failed to load code posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCodePosts();
  }, [user]);

  // Handle code post creation
  const handleCreateCodePost = async (codeContent, codeLanguage) => {
    if (!codeContent.trim()) {
      addToast('Please add some code to your post', 'error');
      return;
    }

    setIsSubmittingPost(true);

    try {
      const token = localStorage.getItem('token');

      const postData = {
        content: codeContent,
        isCodePost: true,
        codeLanguage: codeLanguage
      };

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error('Failed to create code post');
      }

      const newPost = await response.json();
      setCodePosts(prevPosts => [newPost, ...prevPosts]);
      setShowCodePostModal(false);
      addToast('Code post created successfully!', 'success');
    } catch (error) {
      console.error('Error creating code post:', error);
      addToast('Failed to create code post. Please try again.', 'error');
    } finally {
      setIsSubmittingPost(false);
    }
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

  const filteredCodePosts = selectedLanguage === 'all'
    ? codePosts
    : codePosts.filter(post => post.codeLanguage === selectedLanguage);

  if (isLoading) {
    return (
      <div>
        <Navbar user={user} />
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DarkColor"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar user={user} />
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl text-red-600 font-semibold mb-4">Error</h2>
            <p>{error}</p>
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
      <Navbar user={user} />
      
      <div className="max-w-4xl mx-auto my-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-ExtraDarkColor">Code Snippets</h1>
          <button
            onClick={() => setShowCodePostModal(true)}
            className="px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor"
          >
            <i className='bx bx-code-alt mr-2'></i>
            Add Code Post
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="languageFilter">
            Filter by Language
          </label>
          <select
            id="languageFilter"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor focus:border-DarkColor"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {filteredCodePosts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-6xl mb-4 text-gray-300">
              <i className='bx bx-code-block'></i>
            </div>
            <h2 className="text-xl font-semibold mb-2">No code posts found</h2>
            <p className="text-gray-600 mb-4">
              {selectedLanguage === 'all' 
                ? "Start sharing your code snippets with the community!" 
                : `No code posts found for ${selectedLanguage}. Try another language or create one!`}
            </p>
            <button
              onClick={() => setShowCodePostModal(true)}
              className="px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor"
            >
              Create Your First Code Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCodePosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center mb-4">
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
                  
                  <CodeExecutor code={post.content} language={post.codeLanguage || 'javascript'} />
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        <i className='bx bx-comment mr-1'></i>
                        {post.comments?.length || 0} Comments
                      </span>
                      <button
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="text-sm text-DarkColor hover:underline"
                      >
                        View Full Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <CodePostModal
        isOpen={showCodePostModal}
        onClose={() => setShowCodePostModal(false)}
        user={user}
        handleCreateCodePost={handleCreateCodePost}
        isSubmittingPost={isSubmittingPost}
      />
    </div>
  );
};

export default CodePostsView;