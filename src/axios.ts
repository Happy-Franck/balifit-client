// import axios from 'axios'

// var token = localStorage.getItem('token')
// var http = axios.create({
//   baseURL: "http://127.0.0.1:8000/api",
//   headers : {
//     "Authorization" : `Bearer ${token}`,
//     "Content-Type" : 'application/json'
//   }
// })

import axios from 'axios';
import { APP_CONFIG } from '@/config/constants';

const http = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default http;
