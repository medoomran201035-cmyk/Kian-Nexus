const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// توجيه الصفحة الرئيسية مباشرة إلى الداشبورد بدون أي تسجيل دخول
app.get('/', (req, res) => {
    // لو ملف الداشبورد اسمه dashboard.html (تأكد من اسم الملف عندك في فولدر public)
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});