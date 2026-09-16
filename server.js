const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from both public folder and root directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// MongoDB Connection (مربوط بقاعدة البيانات مباشرة بالباسورد)
const MONGO_URI = 'mongodb+srv://medoomran201035_db_user:1234@cluster0.ykv026a.mongodb.net/kayan_erp?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('🟢 Connected to MongoDB');
  })
  .catch((err) => {
    console.error('🔴 DB Connection Error:', err);
  });

// Homepage Route with automatic file location fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'index.html'), (err2) => {
        if (err2) {
          res.status(404).send('index.html file not found!');
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Kayan Server running on port ${PORT}`);
});