import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/auth/Auth';
// import Post from './components/auth/Post';
import Profile from './components/profile/Profile';
import Dashboard from './components/dashboard/Dashboard';
import { ToastProvider } from './components/common/Toast';
import Messaging from './components/messaging/Messaging';
import SinglePostView from './components/post/SinglePostView';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} /> {/* Current user profile */}
          <Route path="/profile/:userId" element={<Profile />} /> {/* Add this route for viewing other users */}
          <Route path="/messages" element={<Messaging />} />
          <Route path="/messages/:userId" element={<Messaging />} />
          <Route path="/post/:postId" element={<SinglePostView />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
