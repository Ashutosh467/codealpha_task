const BASE_URL = '/api';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to JSON if we are not sending FormData
  if (!(options.body instanceof FormData) && !options.isFormData) {
    headers['Content-Type'] = 'application/json';
  } else {
    // Force deletion of Content-Type so browser sets boundary itself
    delete headers['Content-Type'];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const auth = {
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiFetch('/auth/me')
};

export const users = {
  getProfile: (username) => apiFetch(`/users/${username}`),
  updateProfile: (data) => apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiFetch('/users/avatar', { method: 'POST', body: formData, isFormData: true });
  },
  searchUsers: (query) => apiFetch(`/users/search?q=${encodeURIComponent(query)}`)
};

export const posts = {
  getFeed: (page = 0, limit = 10) => apiFetch(`/posts/feed?page=${page}&limit=${limit}`),
  getExplore: () => apiFetch('/posts/explore'),
  getUserPosts: (username) => apiFetch(`/posts/user/${username}`),
  createPost: (data) => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.image) formData.append('image', data.image);
    return apiFetch('/posts', { method: 'POST', body: formData, isFormData: true });
  },
  editPost: (id, content) => apiFetch(`/posts/${id}`, { method: 'PUT', body: JSON.stringify({ content }) }),
  deletePost: (id) => apiFetch(`/posts/${id}`, { method: 'DELETE' }),
  toggleLike: (id) => apiFetch(`/posts/${id}/like`, { method: 'POST' })
};

export const comments = {
  getComments: (postId) => apiFetch(`/comments/${postId}`),
  createComment: (postId, content) => apiFetch(`/comments/${postId}`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteComment: (id) => apiFetch(`/comments/${id}`, { method: 'DELETE' })
};

export const follows = {
  toggleFollow: (username) => apiFetch(`/follows/${username}`, { method: 'POST' }),
  getFollowers: (username) => apiFetch(`/follows/${username}/followers`),
  getFollowing: (username) => apiFetch(`/follows/${username}/following`)
};

// Stories
export const stories = {
  getFeed: () => apiFetch('/stories/feed'),
  getUserStories: (username) => apiFetch(`/stories/user/${username}`),
  create: (formData) => apiFetch('/stories', { method: 'POST', body: formData, isFormData: true }),
  view: (id) => apiFetch(`/stories/${id}/view`, { method: 'POST' }),
  delete: (id) => apiFetch(`/stories/${id}`, { method: 'DELETE' }),
};

// Notifications
export const notifications = {
  getAll: () => apiFetch('/notifications'),
  readAll: () => apiFetch('/notifications/read-all', { method: 'POST' }),
  readOne: (id) => apiFetch(`/notifications/read/${id}`, { method: 'POST' }),
  delete: (id) => apiFetch(`/notifications/${id}`, { method: 'DELETE' }),
};

// Explore
export const explore = {
  getPosts: () => apiFetch('/posts/explore'),
  search: (q) => apiFetch(`/users/search?q=${encodeURIComponent(q)}`),
  getSuggestions: () => apiFetch('/users/suggestions'),
};

// Saves
export const saves = {
  toggle: (postId) => apiFetch(`/posts/${postId}/save`, { method: 'POST' }),
  getSaved: (username) => apiFetch(`/users/${username}/saved`),
};
