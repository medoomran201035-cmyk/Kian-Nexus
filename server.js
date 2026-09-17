const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// تحويل أي طلب للرئيسية أو صفحة الدخول إلى الداشبورد مباشرة
app.get(['/', '/login.html'], (req, res) => {
    // لو اسم ملف الداشبورد عندك dashboard.html (لو اسمه index.html غيرها هنا)
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});