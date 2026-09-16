const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://medoomran201035_db_user:1234@cluster0.ykv026a.mongodb.net/kayan_erp?appName=Cluster0';

// User Schema & Model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hr', 'user'], default: 'user' },
  name: String
});

const User = mongoose.model('User', userSchema);

// Automatic Seeding of Default Accounts
async function seedDefaultUsers() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.create([
        { username: 'admin', password: '1234', role: 'admin', name: 'System Admin' },
        { username: 'hr', password: '1111', role: 'hr', name: 'HR Manager' },
        { username: 'mohamed', password: '0000', role: 'user', name: 'Mohamed Faisal' }
      ]);
      console.log('🟢 Default users seeded successfully!');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('🟢 Connected to MongoDB');
    await seedDefaultUsers();
  })
  .catch((err) => {
    console.error('🔴 DB Connection Error:', err);
  });

// Unified Login Handler (يقبل تسجيل الدخول من أي مسار تحتاجه الواجهة الأمامية)
const handleLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
    }
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ success: true, message: 'تم تسجيل الدخول بنجاح', role: user.role, name: user.name });
    } else {
      res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في السيرفر' });
  }
};

// Register login on all possible routes
app.post('/api/login', handleLogin);
app.post('/login', handleLogin);
app.post('/auth/login', handleLogin);

// Add Employee API Route (Restricted to Admin & HR only)
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role, name, requesterRole } = req.body;
    
    if (requesterRole && requesterRole !== 'admin' && requesterRole !== 'hr') {
      return res.status(403).json({ success: false, message: 'غير مسموح لك بإضافة موظفين (للإدارة والـ HR فقط)' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم موجود مسبقاً' });
    }

    const newUser = await User.create({ username, password, role: role || 'user', name });
    res.json({ success: true, message: 'تم إضافة الموظف بنجاح', user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في حفظ المستخدم الجديد' });
  }
});

// Get Users List API Route
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

// Routes for Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'index.html'), (err2) => {
        if (err2) {
          res.status(404).send('index.html file not found!');
        }
      });
    }
  });
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'login.html'), (err2) => {
        if (err2) {
          res.status(404).send('login.html file not found!');
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Kayan Server running on port ${PORT}`);
});