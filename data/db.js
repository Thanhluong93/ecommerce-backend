const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://luong6011:qfcAjaDq15J4BuOv@cluster0.nblruqn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("✅ Kết nối MongoDB thành công");
  } catch (err) {
    console.error("❌ Lỗi khi kết nối MongoDB:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
