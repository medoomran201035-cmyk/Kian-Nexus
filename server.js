const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Schemas & Models
const UserSchema = new mongoose.Schema({ username: {type: String, unique: true}, password: String, role: String, name: String });
const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({ name: String, assignee: String, status: String, fileUrl: String, fileName: String });
const Task = mongoose.model('Task', TaskSchema);

const ITTicketSchema = new mongoose.Schema({ issue: String, dept: String, status: String, fileUrl: String, fileName: String });
const ITTicket = mongoose.model('ITTicket', ITTicketSchema);

const EmployeeSchema = new mongoose.Schema({ name: String, role: String, date: String, fileUrl: String, fileName: String });
const Employee = mongoose.model('Employee', EmployeeSchema);

const FileRecordSchema = new mongoose.Schema({ name: String, desc: String, size: String, filePath: String });
const FileRecord = mongoose.model('FileRecord', FileRecordSchema);

const SaleSchema = new mongoose.Schema({ item: String, amount: Number, date: String });
const Sale = mongoose.model('Sale', SaleSchema);

const WarehouseSchema = new mongoose.Schema({ item: String, qty: Number });
const Warehouse = mongoose.model('Warehouse', WarehouseSchema);

const FinanceSchema = new mongoose.Schema({ desc: String, amount: Number });
const Finance = mongoose.model('Finance', FinanceSchema);

const AttendanceSchema = new mongoose.Schema({ name: String, status: String, time: String });
const Attendance = mongoose.model('Attendance', AttendanceSchema);

const ActivitySchema = new mongoose.Schema({ text: String, user: String, time: String });
const Activity = mongoose.model('Activity', ActivitySchema);

async function logActivity(text, user = 'النظام') {
    try {
        await Activity.create({ text, user, time: new Date().toLocaleString('ar-EG') });
    } catch(e) { console.error(e); }
}

async function initAdmin() {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            await User.create({ username: 'admin', password: '123456', role: 'Admin', name: 'مهندس محمد فيصل صلاح عمران' });
            console.log('Default Admin created: admin / 123456');
        }
    } catch(err) { console.error(err); }
}

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if(user) {
            await logActivity(`تسجيل دخول المستخدم: ${user.name}`, user.name);
            res.json({ success: true, user: { name: user.name, role: user.role, username: user.username } });
        } else {
            res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }
    } catch(err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم إرفاق ملف' });
        res.json({
            success: true,
            filePath: `/uploads/${req.file.filename}`,
            originalName: req.file.originalname,
            size: (req.file.size / 1024).toFixed(1) + ' KB'
        });
    } catch(err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/download/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) res.download(filePath);
    else res.status(404).json({ success: false, message: 'الملف غير موجود' });
});

app.get('/api/backup', async (req, res) => {
    try {
        const backupData = {
            tasks: await Task.find(),
            it: await ITTicket.find(),
            emp: await Employee.find(),
            users: await User.find(),
            files: await FileRecord.find(),
            sales: await Sale.find(),
            warehouse: await Warehouse.find(),
            finance: await Finance.find(),
            attendance: await Attendance.find(),
            activities: await Activity.find()
        };
        await logActivity('تم إنشاء نسخة احتياطية لقاعدة البيانات', 'مدير النظام');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=kayan_erp_backup.json');
        res.send(JSON.stringify(backupData, null, 2));
    } catch(err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

function setupFullCRUD(route, Model, entityName) {
    app.get(`/api/${route}`, async (req, res) => {
        try {
            const data = await Model.find();
            res.json(data);
        } catch(err) { res.status(500).json({ error: err.message }); }
    });

    app.post(`/api/${route}`, async (req, res) => {
        try {
            const item = await Model.create(req.body);
            await logActivity(`إضافة ${entityName} جديد`, 'مدير النظام');
            res.json({ success: true, data: item });
        } catch(err) { res.status(500).json({ success: false, error: err.message }); }
    });

    app.delete(`/api/${route}/:id`, async (req, res) => {
        try {
            await Model.findByIdAndDelete(req.params.id);
            await logActivity(`حذف ${entityName}`, 'مدير النظام');
            res.json({ success: true });
        } catch(err) { res.status(500).json({ success: false, error: err.message }); }
    });
}

setupFullCRUD('tasks', Task, 'مهمة');
setupFullCRUD('it', ITTicket, 'تذكرة دعم فني');
setupFullCRUD('emp', Employee, 'موظف');
setupFullCRUD('users', User, 'مستخدم');
setupFullCRUD('files', FileRecord, 'ملف بأرشيف');
setupFullCRUD('sales', Sale, 'مبيعة');
setupFullCRUD('warehouse', Warehouse, 'منتج مخزن');
setupFullCRUD('finance', Finance, 'معاملة مالية');
setupFullCRUD('attendance', Attendance, 'سجل حضور');

app.get('/api/activities', async (req, res) => {
    try {
        const acts = await Activity.find().sort({ _id: -1 }).limit(50);
        res.json(acts);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kayan_erp';
mongoose.connect(MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');
    initAdmin();
})
.catch(err => console.error(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));