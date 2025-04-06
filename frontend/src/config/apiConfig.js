// API Base URL
const API_BASE_URL = 'http://localhost:8080';

// Auth endpoints
const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
};

// Export all API endpoints
export {
  API_BASE_URL,
  AUTH_ENDPOINTS,
};

// For future use - other API endpoints can be added here
// Example:
// export const USER_ENDPOINTS = {
//   GET_PROFILE: `${API_BASE_URL}/api/users/profile`,
//   UPDATE_PROFILE: `${API_BASE_URL}/api/users/profile`,
// };
