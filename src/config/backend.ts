// Re-export from lib for backward compatibility
import apiClient from "../lib/apiClient";
import "../lib/apiClient.interceptors"; // Ensure interceptors are registered

export { handleResponseError } from "../lib/apiClient.interceptors";
export default apiClient;
