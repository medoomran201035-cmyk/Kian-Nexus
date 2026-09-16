const express = require('express');
const router = express.Router();

// بيانات المستخدمين الافتراضية
const users = [
  { username: 'admin', password: '1234', role: 'admin', name: 'مدير النظام (Admin)' },
  { username: 'hr', password: '1111', role: 'hr', name: 'شؤون الموظفين (HR)' },
  { username: 'mohamed', password: '0000', role: 'employee', name: 'محمد فيصل (Employee)' }
];

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  res.json({
    success: true,
    message: 'تم تسجيل الدخول بنجاح',
    user: { name: user.name, role: user.role, username: user.username }
  });
});

module.exports = router;