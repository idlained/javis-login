const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mysql = require("mysql2/promise");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("./middleware/authMiddleware");
require("dotenv").config();

console.log("ENV CHECK:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 5,
    message: "Terlalu banyak percobaan login, coba lagi nanti"
});
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/login", loginLimiter);
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// koneksi DB
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

(async () => {
    try {
        const [rows] = await db.query("SELECT 1");
        console.log("DB CONNECTED OK:", rows);
    } catch (err) {
        console.error("DB FAILED:", err);
    }
})();

// login endpoint
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ message: "Email dan password wajib diisi" });

    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            [email, email]
          );
        console.log("DB Result:", rows); // <- log hasil query
        if(rows.length === 0) return res.status(401).json({ message: "User tidak ditemukan" });
    
        const user = rows[0];
        console.log("User data:", user); // <- log user yang diambil dari DB
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch); // <- cek hasil compare
        if(!isMatch) return res.status(401).json({ message: "Password salah" });
    
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
        res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
        res.json({ message: "Login berhasil" });
    } catch(err) {
        console.error("Login error:", err); // <- log error lengkap
        res.status(500).json({ message: "Server error" });
    }
});

// dashboard protected
app.get("/api/dashboard", authMiddleware, (req, res) => {
    res.json({ message: `Welcome user ID ${req.user.id}` });
});

// logout
app.post("/api/logout", (req,res)=>{
    res.clearCookie("token");
    res.json({ message: "Logout berhasil" });
});

// app.listen(process.env.PORT, ()=>console.log(`Server running on port ${process.env.PORT}`));
if (require.main === module) {
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
}

module.exports = app;