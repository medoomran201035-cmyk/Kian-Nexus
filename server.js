const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// الاتصال بقاعدة البيانات MongoDB
mongoose.connect('mongodb://localhost:27017/kayan_erp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to Kayan ERP Database Successfully'))
.catch(err => console.error('Database connection error:', err));

// ================= المخططات (Schemas) =================

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['customer', 'supplier'], required: true },
    phone: String,
    email: String,
    company: String,
    createdAt: { type: Date, default: Date.now }
});
const Customer = mongoose.model('Customer', customerSchema);

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: String,
    baseSalary: { type: Number, required: true },
    netSalary: Number,
    createdAt: { type: Date, default: Date.now }
});
const Employee = mongoose.model('Employee', employeeSchema);

// 1. مخطط المخازن والمنتجات الجديد
const inventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    sku: String,
    quantity: { type: Number, default: 0 },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Inventory = mongoose.model('Inventory', inventorySchema);

// 2. مخطط الحسابات المالية الجديد
const financeSchema = new mongoose.Schema({
    description: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Finance = mongoose.model('Finance', financeSchema);

const alertSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: String,
    type: { type: String, enum: ['warning', 'info', 'danger'], default: 'info' },
    createdAt: { type: Date, default: Date.now }
});
const Alert = mongoose.model('Alert', alertSchema);


// ================= مسارات الـ APIs =================

// CRM
app.get('/api/crm', async (req, res) => res.json(await Customer.find().sort({ createdAt: -1 })));
app.post('/api/crm', async (req, res) => {
    try { const c = new Customer(req.body); await c.save(); res.status(201).json({ success: true, c }); } 
    catch (err) { res.status(400).json({ error: err.message }); }
});

// HR
app.get('/api/hr', async (req, res) => res.json(await Employee.find().sort({ createdAt: -1 })));
app.post('/api/hr', async (req, res) => {
    try {
        const { baseSalary, deductions = 0, bonuses = 0 } = req.body;
        const netSalary = Number(baseSalary) + Number(bonuses) - Number(deductions);
        const emp = new Employee({ ...req.body, netSalary });
        await emp.save();
        res.status(201).json({ success: true, emp });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Inventory (المخازن)
app.get('/api/inventory', async (req, res) => res.json(await Inventory.find().sort({ createdAt: -1 })));
app.post('/api/inventory', async (req, res) => {
    try { const inv = new Inventory(req.body); await inv.save(); res.status(201).json({ success: true, inv }); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

// Finance (الماليات)
app.get('/api/finance', async (req, res) => res.json(await Finance.find().sort({ createdAt: -1 })));
app.post('/api/finance', async (req, res) => {
    try { const fin = new Finance(req.body); await fin.save(); res.status(201).json({ success: true, fin }); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

// Alerts
app.get('/api/alerts', async (req, res) => res.json(await Alert.find().sort({ createdAt: -1 }).limit(10)));
app.post('/api/alerts', async (req, res) => {
    try { const alert = new Alert(req.body); await alert.save(); res.json({ success: true, alert }); }
    catch (err) { res.status(400).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Kayan ERP Server running on port ${PORT}`));