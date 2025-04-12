const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Kết nối MongoDB thành công");
  } catch (err) {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1); // Dừng ứng dụng nếu không thể kết nối đến MongoDB
  }
};

module.exports = connectDB;
