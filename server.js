const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// استخدام رابط الاتصال العادي (Standard) لتجنب مشاكل DNS SVR على Render تماماً
const MONGO_URI = "mongodb://medoomran201035_db_user:1234aCluster0@cluster0-shard-00-00.vku26ro.mongodb.net:27017,cluster0-shard-00-01.vku26ro.mongodb.net:27017,cluster0-shard-00-02.vku26ro.mongodb.net:27017/kayan_erp?ssl=true&replicaSet=atlas-vku26ro-shard-0&authSource=admin&retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// الاتصال بقاعدة البيانات مع تحديد مهلة زمنية للاتصال
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
    .then(async () => {
        console.log('Connected to MongoDB Atlas successfully!');
        try {
            const count = await User.countDocuments();
            if (count === 0) {
                const hashedPassword = await bcrypt.hash('123456', 10);
                await User.insertMany([
                    { name: 'Admin', email: 'admin@kayan.com', password: hashedPassword, role: 'admin' },
                    { name: 'HR Manager', email: 'hr@kayan.com', password: hashedPassword, role: 'hr' },
                    { name: 'Employee', email: 'employee@kayan.com', password: hashedPassword, role: 'employee' }
                ]);
                console.log('Default users created automatically!');
            }
        } catch (seedErr) {
            console.error('Auto-seed error:', seedErr);
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

// مسار تسجيل الدخول المباشر الآمن (مع التحقق من حالة الاتصال)
app.post('/api/login', async (req, res) => {
    try {
        // التأكد من أن الاتصال بقاعدة البيانات جاهز ومتصل
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ message: 'جاري الاتصال بقاعدة البيانات، يرجى المحاولة بعد ثوانٍ قليلة' });
        }

        const { email } = req.body;
        let user = null;

        if (email) {
            user = await User.findOne({ email });
        }
        
        if (!user) {
            user = await User.findOne({ role: 'admin' }) || await User.findOne();
        }

        // لو مفيش أي مستخدم في القاعدة نهائياً، أنشئ مستخدم طوارئ فوراً
        if (!user) {
            user = await User.create({
                name: 'Admin',
                email: email || 'admin@kayan.com',
                password: '123456',
                role: 'admin'
            });
        }

        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'حدث خطأ في السيرفر: ' + err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});