const express = require("express");
require("dotenv").config(); // ✅ Nạp biến môi trường từ file .env

const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("./models/User"); // Model MongoDB

const app = express();

// ✅ Cấu hình CORS cho phép frontend trên Vercel truy cập backend
app.use(cors({
  origin: [
    "http://localhost:3000", // Local dev
    "https://ecommerce-frontend-indol-sigma.vercel.app" // Vercel frontend
  ]
}));

app.use(express.json());

// ✅ Kết nối MongoDB từ biến môi trường
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Kết nối MongoDB thành công"))
.catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));

// ✅ Lấy tất cả user (ẩn mật khẩu)
app.get("/data/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách user" });
  }
});

// ✅ Đăng nhập
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("📩 Nhận yêu cầu đăng nhập:", email);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("🔍 Không tìm thấy user");
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu!" });
    }

    console.log("✅ Đăng nhập thành công:", user.email);
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone
    });
  } catch (err) {
    res.status(500).json({ message: "Có lỗi xảy ra khi đăng nhập" });
  }
});

// ✅ Cập nhật thông tin user
app.put("/data/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật user" });
  }
});

// ✅ Đăng ký user
app.post("/register", [
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password").isLength({ min: 6 }).withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
], async (req, res) => {
  const errors = validationResult(req);

    // ✅ In ra dữ liệu nhận được từ frontend
    console.log("📨 Dữ liệu nhận từ frontend:", req.body);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được đăng ký!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword
    });

    await newUser.save();
    console.log("🆕 Đăng ký user mới:", email);

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi đăng ký" });
  }
});

// ✅ Khởi động server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`✅ Backend đang chạy tại http://localhost:${PORT}`));
