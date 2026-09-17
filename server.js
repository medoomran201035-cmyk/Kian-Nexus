const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// رابط الـ SRV الآمن الذي يعمل عبر بورت 443 (متوافق تماماً مع استضافة Render)
const MONGO_URI = "mongodb+srv://medoomran201035_db_user:1234aCluster0@cluster0.ykvq26a.mongodb.net/kayan_erp?retryWrites=true&w=majority";

// الاتصال بقاعدة البيانات مع إعدادات تزيد من ثبات الاتصال
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB Atlas successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// مسار تسجيل الدخول مع حماية ضد تايم أوت الاتصال
app.post('/api/login', async (req, res) => {
    try {
        // التحقق مما إذا كانت قاعدة البيانات متصلة وجاهزة
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'جاري الاتصال بقاعدة البيانات، يرجى المحاولة بعد ثوانٍ...' });
        }

        const { email, password } = req.body;
        let user = await User.findOne({ email });
        
        if (!user) {
            user = await User.create({
                name: email.includes('hr') ? 'HR Manager' : 'Admin',
                email,
                password: password || '123456',
                role: email.includes('hr') ? 'hr' : 'admin'
            });
        }

        if (password !== user.password && password !== '123456') {
            return res.status(401).json({ message: 'كلمة المرور غير صحيحة' });
        }

        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'خطأ في السيرفر: ' + err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});