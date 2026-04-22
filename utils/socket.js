const { Server } = require("socket.io");
const logger = require("./logger");

let io;

/**
 * Initialize Socket.IO with Express HTTP server
 * 
 * Purpose: Enable real-time bidirectional communication between
 * backend and frontend clients
 * 
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Room-based communication
 * - Error handling & logging
 * - CORS configuration for production
 * 
 * @param {http.Server} server - Express HTTP server
 * @returns {Server} Socket.IO instance
 */
const init = (server) => {
  io = new Server(server, {
    cors: {
      // In development: allow localhost
      // In production: use specific frontend URL from env
      origin: process.env.SOCKET_CORS_ORIGIN ? 
        process.env.SOCKET_CORS_ORIGIN.split(",") : 
        [
          "http://localhost:5173",      // Vite dev server
          "http://localhost:3000",       // React dev server
          "http://localhost",            // Docker container
          "http://127.0.0.1:5173"
        ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    },
    reconnection: true,
    reconnectionDelay: 1000,           // Wait 1s before first retry
    reconnectionDelayMax: 5000,        // Max 5s wait between retries
    reconnectionAttempts: 5            // Try 5 times before giving up
  });

  /**
   * Connection handler
   * Called when a new client successfully connects
   */
  io.on("connection", (socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    /**
     * Join room for group-based notifications
     * Example: joinRoom("class-2024")
     */
    socket.on("joinRoom", (room) => {
      socket.join(room);
      logger.debug(`Client ${socket.id} joined room: ${room}`);
    });

    /**
     * Leave room
     */
    socket.on("leaveRoom", (room) => {
      socket.leave(room);
      logger.debug(`Client ${socket.id} left room: ${room}`);
    });

    /**
     * Socket-level error handler
     */
    socket.on("error", (error) => {
      logger.error(`Socket error for client ${socket.id}:`, error);
    });

    /**
     * Disconnection handler
     * Clean up when client disconnects
     */
    socket.on("disconnect", (reason) => {
      logger.info(`🔌 Client disconnected: ${socket.id} (Reason: ${reason})`);
      
      // Log abnormal disconnections
      if (reason === "transport close" || reason === "server namespace disconnect") {
        logger.warn(`Abnormal disconnect for ${socket.id} - reason: ${reason}`);
      }
    });
  });

  logger.info("✅ Socket.IO initialized successfully");
  return io;
};

/**
 * Get Socket.IO instance
 * Throws error if not initialized
 * @returns {Server} Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error("❌ Socket.io not initialized! Call init(server) first.");
  }
  return io;
};

/**
 * Emit event to all connected clients
 * @param {string} event - Event name (e.g., "studentCreated")
 * @param {Object} data - Data to send
 */
const emitToAll = (event, data) => {
  const io = getIO();
  io.emit(event, data);
  logger.debug(`📤 Emitted event "${event}" to all clients`);
};

/**
 * Emit event to specific room
 * @param {string} room - Room name
 * @param {string} event - Event name
 * @param {Object} data - Data to send
 */
const emitToRoom = (room, event, data) => {
  const io = getIO();
  io.to(room).emit(event, data);
  logger.debug(`📤 Emitted event "${event}" to room "${room}"`);
};

/**
 * Emit event to all except specific socket
 * Useful to acknowledge action to all clients except sender
 * @param {string} socketId - Socket ID to exclude
 * @param {string} event - Event name
 * @param {Object} data - Data to send
 */
const emitExcept = (socketId, event, data) => {
  const io = getIO();
  io.except(socketId).emit(event, data);
  logger.debug(`📤 Emitted event "${event}" to all except ${socketId}`);
};

module.exports = {
  init,
  getIO,
  emitToAll,
  emitToRoom,
  emitExcept
};
