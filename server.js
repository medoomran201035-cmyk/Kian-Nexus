const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// تشغيل ملفات الـ public الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// توجيه الصفحة الرئيسية مباشرة إلى index.html بدون أي تسجيل دخول
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});