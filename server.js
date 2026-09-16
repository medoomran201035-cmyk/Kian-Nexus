const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware الأساسية
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// إعداد مجلد تخزين الملفات والصور
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد Multer لدعم رفع أي صيغة ملف أو صورة بأمان
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // حد أقصى 50 ميجابايت للملف
});

app.use('/uploads', express.static(uploadDir));

// ==================== نماذج قاعدة البيانات (MongoDB Schemas) ====================
const TaskSchema = new mongoose.Schema({ name: String, assignee: String, status: String });
const Task = mongoose.model('Task', TaskSchema);

const ITTicketSchema = new mongoose.Schema({ issue: String, dept: String, status: String });
const ITTicket = mongoose.model('ITTicket', ITTicketSchema);

const EmployeeSchema = new mongoose.Schema({ name: String, role: String, date: String });
const Employee = mongoose.model('Employee', EmployeeSchema);

const UserSchema = new mongoose.Schema({ name: String, role: String, date: String });
const User = mongoose.model('User', UserSchema);

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

const ActivitySchema = new mongoose.Schema({ text: String, time: String });
const Activity = mongoose.model('Activity', ActivitySchema);


// ==================== مسارات رفع وتحميل الملفات ====================
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'لم يتم إرفاق أي ملف' });
        }
        res.json({
            success: true,
            message: 'تم رفع الملف بنجاح',
            filePath: `/uploads/${req.file.filename}`,
            originalName: req.file.originalname,
            size: (req.file.size / 1024).toFixed(1) + ' KB'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ success: false, message: 'الملف غير موجود' });
    }
});


// ==================== مسارات العمليات (CRUD Endpoints) ====================
function setupCRUD(app, routeName, Model) {
    app.get(`/api/${routeName}`, async (req, res) => {
        try {
            const data = await Model.find();
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post(`/api/${routeName}`, async (req, res) => {
        try {
            const newItem = await Model.create(req.body);
            res.json({ success: true, data: newItem });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    app.delete(`/api/${routeName}/:id`, async (req, res) => {
        try {
            await Model.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });
}

setupCRUD(app, 'tasks', Task);
setupCRUD(app, 'it', ITTicket);
setupCRUD(app, 'emp', Employee);
setupCRUD(app, 'users', User);
setupCRUD(app, 'files', FileRecord);
setupCRUD(app, 'sales', Sale);
setupCRUD(app, 'warehouse', Warehouse);
setupCRUD(app, 'finance', Finance);
setupCRUD(app, 'attendance', Attendance);
setupCRUD(app, 'activities', Activity);


// ==================== الاتصال بقاعدة البيانات وتشغيل الخادم ====================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kayan_erp';

mongoose.connect(MONGO_URI)
.then(() => console.log('Connected to MongoDB successfully'))
.catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Kayan ERP Enterprise Ultimate Server running on port ${PORT}`);
});