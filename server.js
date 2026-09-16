const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// تشغيل الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});