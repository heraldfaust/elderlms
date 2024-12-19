import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://elderlms-1.onrender.com", // Ensure this is correct
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (err) => {
    console.error("Request error:", err);
    return Promise.reject(err);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response, // Return response if successful
  (error) => {
    // Handle errors globally
    if (error.response) {
      console.error("Response error:", error.response);

      // Optional: Handle token expiration
      if (error.response.status === 401) {
        console.warn("Unauthorized: Token may have expired");
        // Redirect to login or refresh token logic here
      }
    } else {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
