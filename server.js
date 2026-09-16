const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة البيانات
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kayan_erp';

// 1. نموذج المستخدمين (Users Schema)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'hr', 'employee'], default: 'employee' },
    department: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// 2. نموذج المهام (Tasks Schema)
const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    assignedTo: String,
    department: String,
    status: { type: String, default: 'قيد التنفيذ' },
    createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', TaskSchema);

// 3. نموذج الدعم الفني (Helpdesk Tickets Schema)
const TicketSchema = new mongoose.Schema({
    subject: String,
    description: String,
    department: String,
    status: { type: String, default: 'مفتوحة' },
    createdBy: String,
    createdAt: { type: Date, default: Date.now }
});
const Ticket = mongoose.model('Ticket', TicketSchema);

// الاتصال بقاعدة البيانات وإنشاء الحسابات الافتراضية الثلاثة تلقائياً
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB successfully.');
    
    const adminExists = await User.findOne({ email: 'admin@kayan.com' });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('123', 10);
        
        // 1. حساب الأدمن
        await User.create({
            name: 'المدير التنفيذي (الأدمن)',
            email: 'admin@kayan.com',
            password: hashedPassword,
            role: 'admin',
            department: 'الإدارة العليا'
        });

        // 2. حساب الـ HR التجريبي
        await User.create({
            name: 'مسؤول الموارد البشرية',
            email: 'hr@kayan.com',
            password: hashedPassword,
            role: 'hr',
            department: 'HR'
        });

        // 3. حساب موظف عادي تجريبي
        await User.create({
            name: 'محمد الموظف',
            email: 'emp@kayan.com',
            password: hashedPassword,
            role: 'employee',
            department: 'IT'
        });

        console.log('Default Accounts Created: Admin, HR, Employee (Password: 123)');
    }
}).catch(err => console.error('MongoDB connection error:', err));

// --- المسارات (API Endpoints) ---

// تسجيل الدخول
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'البريد الإلكتروني غير مسجل' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'كلمة المرور غير صحيحة' });

        res.json({
            success: true,
            user: { id: user._id, name: user.name, role: user.role, department: user.department }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// إنشاء موظف جديد (للأدمن و HR فقط)
app.post('/api/users/create', async (req, res) => {
    try {
        const { requesterId, name, email, password, role, department } = req.body;
        const requester = await User.findById(requesterId);
        if (!requester || (requester.role !== 'admin' && requester.role !== 'hr')) {
            return res.status(403).json({ success: false, message: 'صلاحيات الإدارة أو HR فقط' });
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: 'البريد مستخدم بالفعل' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword, role: role || 'employee', department });
        res.json({ success: true, message: 'تم إنشاء الحساب بنجاح', user: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// جلب وإضافة المهام
app.get('/api/tasks', async (req, res) => {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
});

app.post('/api/tasks/add', async (req, res) => {
    const { title, description, assignedTo, department } = req.body;
    const newTask = await Task.create({ title, description, assignedTo, department });
    res.json({ success: true, data: newTask });
});

// جلب وإضافة تذاكر الدعم الفني
app.get('/api/tickets', async (req, res) => {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
});

app.post('/api/tickets/add', async (req, res) => {
    const { subject, description, department, createdBy } = req.body;
    const newTicket = await Ticket.create({ subject, description, department, createdBy });
    res.json({ success: true, data: newTicket });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));