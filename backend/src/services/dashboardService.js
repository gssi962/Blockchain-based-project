const { pool } = require("../config/database");
const transactionService = require("./transactionService");

const getStats = async () => {
    const [[users]] = await pool.query(
        "SELECT COUNT(*) AS totalUsers FROM users"
    );

    const [[assets]] = await pool.query(
        "SELECT COUNT(*) AS totalAssets FROM assets"
    );

    const [[nfts]] = await pool.query(
        "SELECT COUNT(*) AS totalNFTs FROM nfts"
    );

    const [[transactions]] = await pool.query(
        "SELECT COUNT(*) AS totalTransactions FROM transactions"
    );

    return {
        totalUsers: users.totalUsers,
        totalAssets: assets.totalAssets,
        totalNFTs: nfts.totalNFTs,
        totalTransactions: transactions.totalTransactions
    };
};

const getBlockchainStatus = () => {
    return {
        network: "Hyperledger Fabric",
        channel: "crypta-channel",
        consensus: "Raft",
        status: "ONLINE",
        operational: true
    };
};

const getDashboardData = async () => {
    return {
        stats: await getStats(),
        blockchain: getBlockchainStatus(),
        recentTransactions:
            await transactionService.getRecentTransactions(5)
    };
};

module.exports = {
    getStats,
    getBlockchainStatus,
    getDashboardData
};