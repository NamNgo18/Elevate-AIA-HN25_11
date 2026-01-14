/**
 * API Configuration
 * Centralized API base URL configuration using environment variables
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * Helper function to construct full API URLs
 * @param path - API endpoint path (e.g., "/routes/jd")
 * @returns Full API URL
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}
