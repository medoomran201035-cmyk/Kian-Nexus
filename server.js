const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// تشغيل الملفات الثابتة من فولدر public
app.use(express.static(path.join(__dirname, 'public')));

// أي طلب للصفحة الرئيسية أو لو حد حاول يفتح login الممسوح، يوجهه مباشرة لـ index.html
app.get(['/', '/login.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});