const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ملف تخزين البيانات المؤقت (قاعدة بيانات خفيفة وسريعة)
const DB_FILE = path.join(__dirname, 'data.json');

// بيانات افتراضية لو الملف مش موجود
const initialData = {
    properties: [
        { id: 1, title: 'فيلا الروضة الفاخرة', type: 'فيلا', price: '450,000 ر.س', status: 'متاح', location: 'حي الروضة - الرياض' },
        { id: 2, title: 'شقة الياسمين الحديثة', type: 'شقة', price: '120,000 ر.س', status: 'مؤجر', location: 'حي الياسمين - الرياض' },
        { id: 3, title: 'معرض تجاري الواحة', type: 'تجاري', price: '300,000 ر.س', status: 'متاح', location: 'حي الملقا - الرياض' }
    ]
};

// قراءة البيانات
function getDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// حفظ البيانات
function saveDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API: جلب العقارات
app.get('/api/properties', (req, res) => {
    const db = getDatabase();
    res.json(db.properties);
});

// API: إضافة عقار جديد
app.post('/api/properties', (req, res) => {
    const db = getDatabase();
    const newProperty = {
        id: Date.now(),
        title: req.body.title,
        type: req.body.type,
        price: req.body.price,
        status: req.body.status,
        location: req.body.location
    };
    db.properties.push(newProperty);
    saveDatabase(db);
    res.json({ success: true, property: newProperty });
});

// API: حذف عقار
app.delete('/api/properties/:id', (req, res) => {
    const db = getDatabase();
    const id = parseInt(req.params.id);
    db.properties = db.properties.filter(p => p.id !== id);
    saveDatabase(db);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});