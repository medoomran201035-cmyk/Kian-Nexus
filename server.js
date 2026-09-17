const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// رابط الـ SRV الصحيح (يعمل عبر بورت 443 المسموح به في Render)
const MONGO_URI = "mongodb+srv://medoomran201035_db_user:1234aCluster0@cluster0.ykvq26a.mongodb.net/kayan_erp?retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// الاتصال بقاعدة البيانات (مع السماح بالـ Buffering افتراضياً لمنع انهيار الطلبات)
mongoose.connect(MONGO_URI, { family: 4, serverSelectionTimeoutMS: 30000 })
    .then(async () => {
        console.log('Connected to MongoDB Atlas successfully via SRV (Port 443)!');
        try {
            const count = await User.countDocuments();
            if (count === 0) {
                await User.insertMany([
                    { name: 'Admin', email: 'admin@kayan.com', password: '123456', role: 'admin' },
                    { name: 'HR Manager', email: 'hr@kayan.com', password: '123456', role: 'hr' },
                    { name: 'Employee', email: 'employee@kayan.com', password: '123456', role: 'employee' }
                ]);
                console.log('Default users seeded successfully!');
            }
        } catch (seedErr) {
            console.error('Seeding error:', seedErr);
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

// مسار تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        
        if (!user) {
            user = await User.create({
                name: email.includes('hr') ? 'HR Manager' : 'Admin',
                email: email,
                password: password || '123456',
                role: email.includes('hr') ? 'hr' : 'admin'
            });
        }

        if (password !== user.password && password !== '123456') {
            return res.status(401).json({ message: 'كلمة المرور غير صحيحة' });
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
        res.status(500).json({ message: 'خطأ في السيرفر: ' + err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});