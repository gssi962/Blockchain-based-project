const dashboardService = require("../services/dashboardService");
const { success, failure } = require("../utils");

const getDashboard = async (req, res) => {
    try {
        const data = await dashboardService.getDashboardData();
        return success(res, data);
    } catch (error) {
        console.error("Dashboard error:", error);
        return failure(res, "Failed to load dashboard", 500);
    }
};

const getStats = async (req, res) => {
    try {
        const data = await dashboardService.getStats();
        return success(res, data);
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return failure(res, "Failed to load dashboard stats", 500);
    }
};

const blockchainStatus = async (req, res) => {
    try {
        const data = dashboardService.getBlockchainStatus();
        return success(res, data);
    } catch (error) {
        console.error("Blockchain status error:", error);
        return failure(res, "Failed to load blockchain status", 500);
    }
};

module.exports = {
    getDashboard,
    getStats,
    blockchainStatus
};