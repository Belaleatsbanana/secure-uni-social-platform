// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
export const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000;

// Fetch wrapper with timeout and error handling
export const apiFetch = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    throw error;
  }
};

// Authenticated fetch wrapper
export const authFetch = async (endpoint, token, options = {}) => {
  return apiFetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

// Assets URL helper
export const getAssetUrl = (path) => {
  if (!path) return '';
  // Sanitize path to prevent directory traversal
  const sanitizedPath = path.replace(/\.\.\//g, '').replace(/^\//g, '');
  return `${API_BASE_URL}/assets/${sanitizedPath}`;
};
