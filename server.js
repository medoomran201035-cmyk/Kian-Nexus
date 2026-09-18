const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// تقديم الملفات الثابتة من نفس المجلد
app.use(express.static(__dirname));

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/kayan_erp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to Kayan ERP Database'))
.catch(err => console.error('DB error:', err));

// المخططات والمسارات الأساسية
const customerSchema = new mongoose.Schema({
    name: String,
    type: String,
    phone: String,
    createdAt: { type: Date, default: Date.now }
});
const Customer = mongoose.model('Customer', customerSchema);

app.get('/api/crm', async (req, res) => res.json(await Customer.find()));
app.post('/api/crm', async (req, res) => {
    const c = new Customer(req.body);
    await c.save();
    res.json({ success: true, c });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));