const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());
app.use(express.static('public')); // قراءة واجهة المستخدم من مجلد public

// الاتصال بقاعدة البيانات MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kayan_erp')
  .then(() => console.log('🟢 Connected to MongoDB'))
  .catch(err => console.error('🔴 DB Connection Error:', err));

// Routes عشان نستخدمه في app داخل الـ routes أو حفظ الـ io
app.set('socketio', io);

// استدعاء مسارات الأصول والعهد
const assetRoutes = require('./routes/assets');
app.use('/api/assets', assetRoutes);

io.on('connection', (socket) => {
  console.log('🟢 موظف متصل بالأنظمة الحية ' + socket.id);

  socket.on('disconnect', () => {
    console.log('❌ انقطع الاتصال: ' + socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Kayan Server running on port ${PORT}`);
});