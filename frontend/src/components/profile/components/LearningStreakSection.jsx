import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/apiConfig';

const LearningStreakSection = ({ user }) => {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastLearningDate: null,
    heatmapData: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user]);

  const fetchStreakData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/learning/streak/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch streak data');
      }

      const data = await response.json();
      setStreakData(data);
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mt-4">
        <h2 className="text-lg font-semibold text-ExtraDarkColor mb-4 flex items-center">
          <i className='bx bx-flame mr-2'></i>Learning Streak
        </h2>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-DarkColor"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-4">
      <h2 className="text-lg font-semibold text-ExtraDarkColor mb-4 flex items-center">
        <i className='bx bx-flame mr-2'></i>Learning Streak
      </h2>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-DarkColor">{streakData.currentStreak}</div>
          <div className="text-sm text-gray-500">Current Streak</div>
          {streakData.currentStreak > 0 && (
            <div className="text-xs text-orange-500 mt-1">
              <i className='bx bxs-flame mr-1'></i>Keep it up!
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-DarkColor">{streakData.longestStreak}</div>
          <div className="text-sm text-gray-500">Longest Streak</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-DarkColor">
            {Object.keys(streakData.heatmapData || {}).length}
          </div>
          <div className="text-sm text-gray-500">Active Days</div>
        </div>
      </div>
      
      {streakData.lastLearningDate && (
        <div className="mb-4 text-center text-sm text-gray-600">
          Last learning activity: <span className="font-medium">{new Date(streakData.lastLearningDate).toLocaleDateString()}</span>
        </div>
      )}
      
      {/* Simple activity heatmap visualization */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h3>
        <div className="bg-gray-50 p-3 rounded-lg">
          {Object.keys(streakData.heatmapData || {}).length > 0 ? (
            <div className="flex flex-wrap gap-1 justify-center">
              {Object.entries(streakData.heatmapData)
                .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                .slice(-30)
                .map(([date, count]) => (
                  <div 
                    key={date} 
                    className={`w-5 h-5 rounded-sm border border-gray-200 ${
                      count > 3 ? 'bg-green-700' : 
                      count > 2 ? 'bg-green-600' : 
                      count > 1 ? 'bg-green-500' : 
                      'bg-green-400'
                    }`}
                    title={`${date}: ${count} learning ${count === 1 ? 'update' : 'updates'}`}
                  />
                ))
              }
            </div>
          ) : (
            <div className="text-center text-gray-500 py-2 text-sm">
              No recent learning activity
            </div>
          )}
          <div className="text-xs text-center text-gray-500 mt-2">
            Each square represents a day with learning activity
          </div>
        </div>
      </div>
      
      {/* Streak badges */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Streak Achievements</h3>
        <div className="flex space-x-3 justify-center">
          <div className={`text-center p-2 ${streakData.currentStreak >= 3 ? 'text-orange-500' : 'text-gray-400'}`}>
            <i className='bx bxs-flame text-2xl'></i>
            <div className="text-xs mt-1">3 Days</div>
          </div>
          <div className={`text-center p-2 ${streakData.longestStreak >= 7 ? 'text-purple-500' : 'text-gray-400'}`}>
            <i className='bx bxs-flame text-2xl'></i>
            <div className="text-xs mt-1">7 Days</div>
          </div>
          <div className={`text-center p-2 ${streakData.longestStreak >= 14 ? 'text-blue-500' : 'text-gray-400'}`}>
            <i className='bx bxs-flame text-2xl'></i>
            <div className="text-xs mt-1">14 Days</div>
          </div>
          <div className={`text-center p-2 ${streakData.longestStreak >= 30 ? 'text-green-500' : 'text-gray-400'}`}>
            <i className='bx bxs-flame text-2xl'></i>
            <div className="text-xs mt-1">30 Days</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningStreakSection;
