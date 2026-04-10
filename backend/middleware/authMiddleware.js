const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const token = req.cookies.token;

    // cek token ada atau tidak
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // simpan data user ke request
        req.user = decoded;

        // lanjut ke route berikutnya
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token tidak valid" });
    }
}

module.exports = authMiddleware;