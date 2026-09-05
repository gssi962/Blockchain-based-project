const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "blockchain_based_project",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();

        console.log("MySQL database connected successfully");

        connection.release();
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
        throw error;
    }
};

module.exports = {
    pool,
    testConnection
};