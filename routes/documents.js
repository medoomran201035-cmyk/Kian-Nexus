const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { User, Document } = require('../models/UserDocument');

// إعداد رفع الملفات وتخزينها في public/uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15 ميجابايت كحد أقصى
});

// صلاحيات الحماية (Admin أو HR فقط)
const verifyAdminOrHR = async (req, res, next) => {
    try {
        const userId = req.headers['user-id'] || req.body.userId; 
        const user = await User.findById(userId);
        
        if (user && (user.role === 'admin' || user.role === 'hr')) {
            req.currentUser = user;
            next();
        } else {
            return res.status(403).json({ success: false, message: 'غير مصرح! هذه الصلاحية للأدمن والـ HR فقط.' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'خطأ في التحقق من الصلاحيات', error: error.message });
    }
};

// 1. جلب كل المستندات
router.get('/', async (req, res) => {
    try {
        const documents = await Document.find().populate('uploadedBy', 'name email role department');
        res.json({ success: true, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. إضافة مستند أو ملف جديد (Admin & HR Only)
router.post('/add', verifyAdminOrHR, upload.single('file'), async (req, res) => {
    try {
        const { title, department, fileType } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'يرجى إرفاق الملف المطلوبة!' });
        }

        const newDocument = new Document({
            title,
            department,
            fileType,
            fileUrl: `/uploads/${req.file.filename}`,
            uploadedBy: req.currentUser._id
        });

        await newDocument.save();
        res.status(201).json({ success: true, message: 'تمت الإضافة بنجاح!', data: newDocument });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. تعديل مستند (Admin & HR Only)
router.put('/update/:id', verifyAdminOrHR, async (req, res) => {
    try {
        const { title, department, fileType } = req.body;
        const updatedDoc = await Document.findByIdAndUpdate(
            req.params.id,
            { title, department, fileType },
            { new: true }
        );

        if (!updatedDoc) {
            return res.status(404).json({ success: false, message: 'العنصر غير موجود!' });
        }

        res.json({ success: true, message: 'تم التعديل بنجاح!', data: updatedDoc });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. حذف مستند (Admin & HR Only)
router.delete('/delete/:id', verifyAdminOrHR, async (req, res) => {
    try {
        const deletedDoc = await Document.findByIdAndDelete(req.params.id);
        
        if (!deletedDoc) {
            return res.status(404).json({ success: false, message: 'العنصر غير موجود!' });
        }

        res.json({ success: true, message: 'تم الحذف بنجاح!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;