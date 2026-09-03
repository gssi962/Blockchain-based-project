const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { seedData } = require("./src/config/database");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const assetRoutes = require("./src/routes/assetRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const roleRoutes = require("./src/routes/roleRoutes");
const auditRoutes = require("./src/routes/auditRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "CRYPTA Backend is running"
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend healthy",
        blockchain: "Hyperledger Fabric",
        status: "ONLINE"
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/audit", auditRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

const PORT = process.env.PORT || 5000;

seedData()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`CRYPTA Backend running on port ${PORT}`);
            console.log(`http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to start server:", error);
    });