import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "./api-config";

let socket: Socket | null = null;
let socketToken: string | null = null;

function getSocketUrl() {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/.*$/, "").replace(/\/$/, "");
  }
}

export function getSocket(token: string) {
  if (!socket || socketToken !== token) {
    socket?.disconnect();
    socketToken = token;
    socket = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket"],
      withCredentials: true,
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (!socket) {
    return;
  }

  socket.disconnect();
  socket = null;
  socketToken = null;
}
