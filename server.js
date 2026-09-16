const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kayan_erp';

// الاتصال بقاعدة البيانات
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ تم الاتصال بقاعدة البيانات MongoDB بنجاح!'))
.catch((err) => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// استدعاء المسارات
const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const documentRoutes = require('./routes/documents');

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/documents', documentRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال بكفاءة على البورت: ${PORT}`);
});