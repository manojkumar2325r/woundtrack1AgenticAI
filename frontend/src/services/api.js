/**
 * Centralized API Service for WoundTrack-RAG1
 * Communicates with Flask backend REST API.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Helper to handle fetch responses and errors.
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      const errorCode = data?.error?.code || "API_ERROR";
      const error = new Error(errorMsg);
      error.code = errorCode;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const connErr = new Error("Unable to connect to WoundTrack backend server. Please verify the backend is running.");
      connErr.code = "BACKEND_OFFLINE";
      throw connErr;
    }
    throw error;
  }
}

export const api = {
  // 1. Health Check
  getHealth: () => request("/health"),

  // 2. Upload & Analyze Wound Image
  analyzeWound: (formData) =>
    request("/analyze", {
      method: "POST",
      body: formData,
    }),

  // 3. Get Single Analysis Record
  getAnalysis: (id) => request(`/analysis/${id}`),

  // 4. Get Analysis History List
  getHistory: (limit = 50, offset = 0) => request(`/history?limit=${limit}&offset=${offset}`),

  // 5. Delete History Record
  deleteHistoryItem: (id) =>
    request(`/history/${id}`, {
      method: "DELETE",
    }),

  // 6. Get Multi-Visit Progression
  getProgression: (payload = {}) =>
    request("/progression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  // 7. RAG AI Assistant Chat
  sendChatMessage: (message, analysisId = null) =>
    request("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, analysis_id: analysisId }),
    }),

  // Helper to format full media URL
  getMediaUrl: (relativeUrl) => {
    if (!relativeUrl) return "";
    if (relativeUrl.startsWith("http")) return relativeUrl;
    return relativeUrl;
  },
};
