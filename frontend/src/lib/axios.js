import axios from "axios"

const axiosInstance = axios.create({
    baseURL: '/api',
    withCredentials: true, // sends JWT cookie automatically on every request
})

export default axiosInstance;