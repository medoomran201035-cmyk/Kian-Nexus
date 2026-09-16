const express = require('express');
const router = express.Router();
const { User } = require('../models/UserDocument');

// مسار تسجيل الدخول
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة!' });
        }

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// مسار إنشاء مستخدم جديد
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'البريد الإلكتروني مستخدم من قبل!' });
        }

        const newUser = new User({ name, email, password, role, department });
        await newUser.save();

        res.status(201).json({ success: true, message: 'تم إنشاء المستخدم بنجاح!', user: newUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;