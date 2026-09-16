const mongoose = require('mongoose');

// نموذج المستخدم / الموظف
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'hr', 'employee'], default: 'employee', required: true },
    department: { type: String, required: true, enum: ['IT', 'HR', 'Finance', 'Sales', 'CustomerService', 'Operations'] },
    createdAt: { type: Date, default: Date.now }
});

// نموذج المستندات والأرشيف الشامل
const documentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true },
    fileType: { type: String, enum: ['Word', 'Excel', 'PowerPoint', 'PDF', 'Image', 'Other'], required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Document = mongoose.model('Document', documentSchema);

module.exports = { User, Document };