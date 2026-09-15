const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// السماح بقراءة البيانات المرسلة بصيغة JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تشغيل الواجهة الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// مسار تسجيل الدخول (API Login)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // التحقق من بيانات الدخول للصلاحيات
    if (username === 'admin' && password === '123') {
        return res.json({ success: true, role: 'admin', message: 'مرحباً بك يا مدير النظام' });
    } else if (username === 'employee' && password === '456') {
        return res.json({ success: true, role: 'employee', message: 'مرحباً بك يا موظف الدعم' });
    } else {
        return res.status(401).json({ success: false, message: 'خطأ في اسم المستخدم أو كلمة المرور' });
    }
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});