const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MONGO_URI = "mongodb://medoomran201035_db_user:1234aCluster0@ac-9srqykv-shard-00-00.ykvq26a.mongodb.net:27017,ac-9srqykv-shard-01.ykvq26a.mongodb.net:27017,ac-9srqykv-shard-02.ykvq26a.mongodb.net:27017/kayan_erp?ssl=true&replicaSet=atlas-xzefbp-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(MONGO_URI, { family: 4 })
  .then(() => console.log('Connected to MongoDB Atlas successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

app.post('/api/login', (req, res) => {
    res.json({
        message: 'تم تسجيل الدخول بنجاح',
        user: {
            name: 'Admin',
            email: 'admin@kayan.com',
            role: 'admin'
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});