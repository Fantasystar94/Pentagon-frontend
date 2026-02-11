import axios from "axios";


const awsUrl = import.meta.env.VITE_AWS_API_URL || "http://43.201.115.73:8080";
const baseURL = awsUrl;
export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});