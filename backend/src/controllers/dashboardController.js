const dashboardService = require("../services/dashboardService");

const { success, failure } = require("../utils");

// =====================================
// COMPLETE DASHBOARD
// =====================================

const getDashboard = async (req, res) => {
    try {
        res.set("Cache-Control", "no-store");

        const data =
            await dashboardService.getDashboardData(req.user);

        return success(res, data);
    } catch (error) {
        console.error("Dashboard error:", error);

        return failure(
            res,
            "Failed to load dashboard",
            500
        );
    }
};

// =====================================
// DASHBOARD STATS
// =====================================

const getStats = async (req, res) => {
    try {
        res.set("Cache-Control", "no-store");

        // IMPORTANT:
        // User information is passed to dashboardService.
        // dashboardService decides:
        // ADMIN → all users
        // MANAGER/AUDITOR/USER → only own identity

        const data =
            await dashboardService.getStats(req.user);

        console.log(
            "Dashboard Stats User:",
            req.user.name,
            req.user.role_id
        );

        console.log(
            "Dashboard Stats Result:",
            data
        );

        return success(res, data);

    } catch (error) {
        console.error(
            "Dashboard stats error:",
            error
        );

        return failure(
            res,
            "Failed to load dashboard stats",
            500
        );
    }
};

// =====================================
// BLOCKCHAIN STATUS
// =====================================

const blockchainStatus = async (req, res) => {
    try {
        res.set("Cache-Control", "no-store");

        const data =
            dashboardService.getBlockchainStatus();

        return success(res, data);

    } catch (error) {
        console.error(
            "Blockchain status error:",
            error
        );

        return failure(
            res,
            "Failed to load blockchain status",
            500
        );
    }
};

module.exports = {
    getDashboard,
    getStats,
    blockchainStatus
};