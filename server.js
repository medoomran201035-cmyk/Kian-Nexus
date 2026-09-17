const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال المباشر بقاعدة البيانات السحابية (MongoDB Atlas)
const MONGO_URI = "mongodb+srv://medoomran201035_db_user:1234aCluster0.vku26ro.mongodb.net/kayan_erp?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema & Model
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// مسار تسجيل الدخول المباشر (بدون كلمة مرور)
app.post('/api/login', async (req, res) => {
    try {
        const { email } = req.body;

        let user;
        if (email) {
            user = await User.findOne({ email });
        }
        
        if (!user) {
            user = await User.findOne({ role: 'admin' }) || await User.findOne();
        }

        if (!user) {
            return res.status(404).json({ message: 'لم يتم العثور على أي حساب في النظام' });
        }

        // تسجيل الدخول مباشرة بدون التحقق من كلمة المرور
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
        res.status(500).json({ message: 'حدث خطأ في السيرفر' });
    }
});

// مسار افتتاحي
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});