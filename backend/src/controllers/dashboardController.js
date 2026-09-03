const dashboardService =
    require("../services/dashboardService");

const { success } = require("../utils");

const getDashboard = (req, res) => {

    return success(
        res,
        dashboardService.getDashboardData()
    );
};

const getStats = (req, res) => {

    return success(
        res,
        dashboardService.getStats()
    );
};

const blockchainStatus = (req, res) => {

    return success(
        res,
        dashboardService.getBlockchainStatus()
    );
};

module.exports = {
    getDashboard,
    getStats,
    blockchainStatus
};