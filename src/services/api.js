const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// ==================== Auth ====================
export const authAPI = {
  register: (body) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  getMe: () => apiFetch("/auth/me"),

  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    const token = getToken();
    return fetch(`${API_BASE}/auth/profile-picture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      return data;
    });
  },

  deleteProfilePicture: () =>
    apiFetch("/auth/profile-picture", { method: "DELETE" }),
};

// ==================== Templates ====================
export const templateAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/templates${query ? `?${query}` : ""}`);
  },

  getOne: (id) => apiFetch(`/templates/${id}`),

  create: (body) =>
    apiFetch("/templates", { method: "POST", body: JSON.stringify(body) }),

  update: (id, body) =>
    apiFetch(`/templates/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  delete: (id) =>
    apiFetch(`/templates/${id}`, { method: "DELETE" }),
};

// ==================== Favorites ====================
export const favoriteAPI = {
  getAll: () => apiFetch("/favorites"),

  add: (templateId) =>
    apiFetch(`/favorites/${templateId}`, { method: "POST" }),

  remove: (templateId) =>
    apiFetch(`/favorites/${templateId}`, { method: "DELETE" }),
};

// ==================== Chat ====================
// Helper for streaming SSE from the backend
const streamChat = async (endpoint, body, onChunk) => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Stream failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let chatId = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const json = JSON.parse(line.slice(6));
          if (json.chatId) chatId = json.chatId;
          if (json.content) {
            fullText += json.content;
            onChunk(json.content, fullText);
          }
          if (json.done) {
            return { reply: fullText, chatId };
          }
          if (json.error) {
            throw new Error(json.error);
          }
        } catch (e) {
          if (e.message !== "Unexpected end of JSON input") throw e;
        }
      }
    }
  }

  return { reply: fullText, chatId };
};

export const chatAPI = {
  // Streaming — tokens appear word-by-word
  guestStream: (message, history = [], onChunk) =>
    streamChat("/chat/guest/stream", { message, history }, onChunk),

  sendMessageStream: (message, chatId = null, onChunk) =>
    streamChat("/chat/message/stream", { message, chatId }, onChunk),

  // Non-streaming fallbacks
  sendMessage: (message, chatId = null) =>
    apiFetch("/chat/message", {
      method: "POST",
      body: JSON.stringify({ message, chatId }),
    }),

  guestMessage: (message, history = []) =>
    apiFetch("/chat/guest", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),

  getHistory: () => apiFetch("/chat/history"),
  getSession: (id) => apiFetch(`/chat/history/${id}`),
  deleteSession: (id) => apiFetch(`/chat/history/${id}`, { method: "DELETE" }),
};

// ==================== Analytics ====================
export const analyticsAPI = {
  get: () => apiFetch("/analytics"),
};

// ==================== Activity ====================
export const activityAPI = {
  get: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/activity${query ? `?${query}` : ""}`);
  },

  exportUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `${API_BASE}/activity/export${query ? `?${query}` : ""}`;
  },
};

// ==================== Analysis ====================
export const analysisAPI = {
  analyzeDocument: async (file) => {
    const formData = new FormData();
    formData.append("document", file);
    
    const res = await fetch(`${API_BASE}/analysis`, {
      method: "POST",
      body: formData, // fetch automatically sets the correct Content-Type for FormData
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to analyze document");
    }
    return data;
  },
};

// ==================== Documents ====================
export const documentAPI = {
  getFields: (templateTitle) =>
    apiFetch(`/documents/fields/${encodeURIComponent(templateTitle)}`),

  generate: (templateTitle, formData, language = "english") =>
    apiFetch("/documents/generate", {
      method: "POST",
      body: JSON.stringify({ templateTitle, formData, language }),
    }),

  generateStream: async (templateTitle, formData, language = "english", onChunk) => {
    const res = await fetch(`${API_BASE}/documents/generate/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateTitle, formData, language }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Generation failed");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.content) {
              fullText += json.content;
              onChunk(json.content, fullText);
            }
            if (json.done) return fullText;
            if (json.error) throw new Error(json.error);
          } catch (e) {
            if (e.message !== "Unexpected end of JSON input") throw e;
          }
        }
      }
    }
    return fullText;
  },
};
