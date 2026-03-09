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

// ==================== Upload ====================
export const uploadAPI = {
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    return fetch(`${API_BASE}/upload/profile-picture`, {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      return data;
    });
  },

  deleteProfilePicture: (publicId) =>
    apiFetch(`/upload/profile-picture/${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    }),
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
export const chatAPI = {
  // For logged-in users (saves history)
  sendMessage: (message, chatId = null) =>
    apiFetch("/chat/message", {
      method: "POST",
      body: JSON.stringify({ message, chatId }),
    }),

  // For guests (no history saved)
  guestMessage: (message, history = []) =>
    apiFetch("/chat/guest", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),

  getHistory: () => apiFetch("/chat/history"),

  getSession: (id) => apiFetch(`/chat/history/${id}`),

  deleteSession: (id) =>
    apiFetch(`/chat/history/${id}`, { method: "DELETE" }),
};
