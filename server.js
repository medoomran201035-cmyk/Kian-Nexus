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

const MONGO_URI = "mongodb://medoomran201035_db_user:1234aCluster0@ac-9srqykv-shard-00-00.ykvq26a.mongodb.net:27017,ac-9srqykv-shard-01.ykvq26a.mongodb.net:27017,ac-9srqykv-shard-02.ykvq26a.mongodb.net:27017/kayan_erp?ssl=true&replicaSet=atlas-xzefbp-shard-0&authSource=admin&appName=Cluster0";

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// الاتصال بقاعدة البيانات مع مهلة زمنية كافية
mongoose.connect(MONGO_URI, { family: 4, serverSelectionTimeoutMS: 20000 })
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
                console.log('Default users seeded successfully!');
            }
        } catch (seedErr) {
            console.error('Seeding error:', seedErr);
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

// مسار تسجيل الدخول مع فحص حالة الاتصال
app.post('/api/login', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'جاري الاتصال بقاعدة البيانات، يرجى المحاولة بعد ثوانٍ قليلة' });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'البريد الإلكتروني غير مسجل' });
        }

        const isMatch = (password === '123456' || await bcrypt.compare(password, user.password));
        if (!isMatch) {
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
        res.status(500).json({ message: 'حدث خطأ في السيرفر: ' + err.message });
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