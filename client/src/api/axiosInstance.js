import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://elderlms-rb6x-4jq4uir52-eaelll-fausts-projects.vercel.app/",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = JSON.parse(sessionStorage.getItem("accessToken")) || "";

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

export default axiosInstance;
