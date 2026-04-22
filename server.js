const app = require('./app');
const { PORT } = require('./config/app.config');

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
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
