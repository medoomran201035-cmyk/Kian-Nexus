const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// تشغيل الملفات الثابتة من فولدر public
app.use(express.static(path.join(__dirname, 'public')));

// مسارات API افتراضية عشان تمنع التحميل المعلق وتخلي الداشبورد تستقر
app.get('/api/stats', (req, res) => res.json({ employees: 0, tasks: 0, sales: 0 }));
app.get('/api/employees', (req, res) => res.json([]));
app.get('/api/dashboard', (req, res) => res.json({ status: 'success' }));

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});