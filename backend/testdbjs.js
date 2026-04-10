const mysql = require("mysql2/promise");
require("dotenv").config();

async function test() {
    try {
        const db = await mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        const [rows] = await db.query("SELECT 1+1 AS result");
        console.log("DB OK:", rows);
    } catch(err) {
        console.error("DB connection error:", err);
    }
}

test();