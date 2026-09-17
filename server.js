<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل دخول - Kayan ERP</title>
    <style>
        body {
            background-color: #0f172a;
            color: #f8fafc;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .login-card {
            background: #1e293b;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        h2 {
            margin-bottom: 24px;
            color: #38bdf8;
        }
        .form-group {
            margin-bottom: 20px;
            text-align: right;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: #94a3b8;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #334155;
            background: #0f172a;
            color: #fff;
            border-radius: 8px;
            box-sizing: border-box;
            font-size: 16px;
        }
        input:focus {
            border-color: #38bdf8;
            outline: none;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #0284c7;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover {
            background: #0369a1;
        }
        #message {
            margin-top: 15px;
            font-size: 14px;
        }
        .success { color: #4ade80; }
        .error { color: #f87171; }
    </style>
</head>
<body>
    <div class="login-card">
        <h2>تسجيل دخول - Kayan ERP</h2>
        <form id="loginForm">
            <div class="form-group">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" id="email" required value="admin@kayan.com">
            </div>
            <div class="form-group">
                <label for="password">كلمة المرور</label>
                <input type="password" id="password" required value="123456">
            </div>
            <button type="submit">دخول للنظام</button>
        </form>
        <div id="message"></div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');

            messageDiv.textContent = 'جاري التحقق وتسجيل الدخول...';
            messageDiv.className = '';

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.textContent = data.message || 'تم تسجيل الدخول بنجاح';
                    messageDiv.className = 'success';
                    
                    // حفظ بيانات المستخدم في التخزين المحلي
                    if (data.user) {
                        localStorage.setItem('kayan_user', JSON.stringify(data.user));
                    }

                    // الانتقال تلقائياً للوحة التحكم أو الصفحة الرئيسية بعد ثانية
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    messageDiv.textContent = data.message || 'فشل تسجيل الدخول';
                    messageDiv.className = 'error';
                }
            }
            catch (err) {
                messageDiv.textContent = 'حدث خطأ في الاتصال بالسيرفر';
                messageDiv.className = 'error';
            }
        });
    </script>
</body>
</html>