import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume APIs
export const resumeAPI = {
  // Upload resumes
  uploadResumes: (formData) => api.post('/resumes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Get all resumes with pagination and search
  getResumes: (params = {}) => api.get('/resumes', { params }),

  // Get specific resume
  getResume: (id) => api.get(`/resumes/${id}`),
};

// Ask API
export const askAPI = {
  askQuestion: (query, k = 3) => api.post('/ask', { query, k }),
};

// Job APIs
export const jobAPI = {
  // Create job
  createJob: (jobData) => api.post('/jobs', jobData),

  // Get job details
  getJob: (id) => api.get(`/jobs/${id}`),

  // Match job to candidates
  matchJob: (id, top_n = 5) => api.post(`/jobs/${id}/match`, { top_n }),
};

export default api;