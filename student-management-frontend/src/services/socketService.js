import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL.replace('/api/students', '');
const socket = io(SOCKET_URL);

export default socket;
