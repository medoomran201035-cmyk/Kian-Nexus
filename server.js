const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// قراءة البيانات
function getData() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            properties: [
                { id: 1, name: "برج الياسمين السكني", type: "شقق فاخرة", price: "1,200,000 ر.س", status: "متاح" },
                { id: 2, name: "فلات النخيل الراقية", type: "فلل مستقلة", price: "3,500,000 ر.س", status: "محجوز" },
                { id: 3, name: "مجمع الواحة التجاري", type: "مكاتب إدارية", price: "850,000 ر.س", status: "مؤجر" }
            ],
            stats: { totalProperties: 48, activeClients: 124, monthlyRevenue: "450,000 ر.س", occupancyRate: "88%" }
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// API للحصول على بيانات الداش بورد
app.get('/api/dashboard', (req, res) => {
    const data = getData();
    res.json(data);
});

// API لإضافة عقار جديد
app.post('/api/properties', (req, res) => {
    const data = getData();
    const newProp = { id: Date.now(), ...req.body };
    data.properties.push(newProp);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, property: newProp });
});

app.listen(PORT, () => {
    console.log(`Kian-Nexus server running on port ${PORT}`);
});