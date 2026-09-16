const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files (HTML, CSS, JS) from public directory or root
app.use(express.static(path.join(__dirname)));

// MongoDB Connection (رابط قاعدة البيانات مع الباسورد مباشرة بدون مشاكل)
const MONGO_URI = 'mongodb+srv://medoomran201035_db_user:1234@cluster0.ykv026a.mongodb.net/kayan_erp?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('🟢 Connected to MongoDB');
  })
  .catch((err) => {
    console.error('🔴 DB Connection Error:', err);
  });

// Basic Route / Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Kayan Server running on port ${PORT}`);
});