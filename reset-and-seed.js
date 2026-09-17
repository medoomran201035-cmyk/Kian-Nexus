const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/UserDocument');

async function resetAndCreateUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/kayan');
        console.log("🔗 متصل بقاعدة البيانات بنجاح...");

        // مسح كل المستخدمين القدامى
        await User.deleteMany({});
        console.log("🗑️ تم مسح المستخدمين القدامى بنجاح.");

        // تشفير الباسورد الموحد 123456
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // إنشاء الحسابات الثلاثة الجديدة بالصلاحيات
        const newUsers = [
            {
                name: 'System Admin',
                email: 'admin@kayan.com',
                password: hashedPassword,
                role: 'admin'
            },
            {
                name: 'HR Manager',
                email: 'hr@kayan.com',
                password: hashedPassword,
                role: 'hr'
            },
            {
                name: 'Regular Employee',
                email: 'employee@kayan.com',
                password: hashedPassword,
                role: 'employee'
            }
        ];

        await User.insertMany(newUsers);
        console.log("\n✨ تم إنشاء الحسابات بنجاح بكلمة مرور: 123456");
        process.exit(0);
    } catch (error) {
        console.error("❌ حدث خطأ:", error);
        process.exit(1);
    }
}

resetAndCreateUsers();