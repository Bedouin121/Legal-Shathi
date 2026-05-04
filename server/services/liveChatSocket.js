let ioInstance = null;
const onlineLawyers = new Map();

export const setLiveChatIO = (io) => {
  ioInstance = io;
};

export const getLiveChatIO = () => ioInstance;

export const markLawyerOnline = (user, socketId) => {
  if (!user?._id) return;
  const key = String(user._id);
  const current = onlineLawyers.get(key) || { user, socketIds: new Set() };
  current.user = user;
  current.socketIds.add(socketId);
  onlineLawyers.set(key, current);
};

export const markLawyerOffline = (userId, socketId) => {
  const key = String(userId || "");
  if (!onlineLawyers.has(key)) return;
  const current = onlineLawyers.get(key);
  current.socketIds.delete(socketId);
  if (current.socketIds.size === 0) {
    onlineLawyers.delete(key);
    return;
  }
  onlineLawyers.set(key, current);
};

export const getOnlineLawyerCount = () => onlineLawyers.size;

export const emitToOnlineLawyers = (event, payload) => {
  if (!ioInstance) return;
  for (const { socketIds } of onlineLawyers.values()) {
    for (const socketId of socketIds) {
      ioInstance.to(socketId).emit(event, payload);
    }
  }
};
