const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware لتفسير البيانات وإدارة الملفات الثابتة
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة بيانات MongoDB (بدون الخيارات القديمة الملغاة لضمان عدم حدوث خطأ)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kayan_erp';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

// استيراد مسارات الـ Routes
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const documentRoutes = require('./routes/documents');

// ربط المسارات بالـ Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/documents', documentRoutes);

// توجيه جميع الطلبات الأخرى لعرض واجهة المستخدم الرئيسية (Frontend)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// تشغيل السيرفر على البورت المطلوب من منصة Render
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});