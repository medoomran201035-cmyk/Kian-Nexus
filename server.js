const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        const initial = {
            employees: [
                { id: '1', name: 'Admin', username: 'admin', pin: '1234', role: 'admin', department: 'Management' },
                { id: '2', name: 'HR Manager', username: 'hr', pin: '1111', role: 'hr', department: 'Human Resources' },
                { id: '3', name: 'Mohamed', username: 'mohamed', pin: '0000', role: 'employee', department: 'IT Support' }
            ],
            attendance: [],
            tasks: [],
            announcements: [{ id: '1', text: 'Welcome to Kyan IT ERP Cloud System!', date: new Date().toISOString() }]
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/data', (req, res) => {
    res.json(loadData());
});

app.post('/api/data', (req, res) => {
    saveData(req.body);
    res.json({ success: true });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filePath: `/uploads/${req.file.filename}` });
});

app.listen(PORT, () => {
    console.log(`Kyan IT Server running on port ${PORT}`);
});