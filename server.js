const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const app = express();

// ✅ Cấu hình CORS cho phép frontend trên Vercel truy cập backend
app.use(cors({
  origin: [
    "http://localhost:3000", // để test local
    "https://ecommerce-frontend-indol-sigma.vercel.app" // domain frontend trên Vercel
  ]
}));

app.use(express.json());

// Sử dụng đường dẫn tuyệt đối để truy cập users.json
const USERS_FILE = path.join(__dirname, "data", "users.json");

// ✅ GET tất cả user
app.get("/data/users", (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  res.json(users);
});

// ✅ POST đăng nhập
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("📩 Nhận yêu cầu đăng nhập:", email);

  const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  const matchedUser = users.find(user => user.email === email);

  console.log("🔍 Tìm thấy user:", matchedUser ? matchedUser.email : "Không tìm thấy");

  if (!matchedUser) {
    return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
  }

  // Kiểm tra mật khẩu
  bcrypt.compare(password, matchedUser.password, (err, isMatch) => {
    if (err) {
      console.error("❌ Lỗi khi so sánh mật khẩu:", err);
      return res.status(500).json({ message: "Có lỗi xảy ra khi kiểm tra mật khẩu" });
    }

    console.log("🔐 Kết quả so sánh mật khẩu:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
    }

    console.log("✅ Đăng nhập thành công:", matchedUser.email);
    res.json(matchedUser);
  });
});

// ✅ PUT cập nhật thông tin user
app.put("/data/users/:id", (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json(users[index]);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// ✅ POST đăng ký người dùng
app.post("/register", [
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password").isLength({ min: 6 }).withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));

  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "Email đã được đăng ký!" });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: "Có lỗi xảy ra khi hash mật khẩu" });
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      phone,
      password: hashedPassword
    };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log("🆕 Đăng ký user mới:", email);
    res.status(201).json(newUser);
  });
});

// ✅ Khởi động server
const PORT = 3002;
app.listen(PORT, () => console.log(`✅ Backend đang chạy tại http://localhost:${PORT}`));
