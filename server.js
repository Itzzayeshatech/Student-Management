require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { init } = require('./utils/socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
init(server);

// Connect DB first, then start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSockets enabled`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.error(`   Run this to fix it: taskkill /IM node.exe /F`);
      process.exit(1);
    } else {
      throw err;
    }
  });
});
