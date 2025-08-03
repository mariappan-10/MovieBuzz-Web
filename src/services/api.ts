import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5231/api';
// export const API_BASE_URL = 'https://movie-buzz.azurewebsites.net/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default apiClient;