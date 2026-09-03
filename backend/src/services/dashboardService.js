const { store } = require("../config/database");
const transactionService =
    require("./transactionService");

const getStats = () => {

    const totalUsers = store.users.length;

    const totalAssets = store.assets.length;

    const totalNFTs = store.assets.filter(
        asset => asset.nftId
    ).length;

    const totalTransactions =
        store.transactions.length;

    return {
        totalUsers,
        totalAssets,
        totalNFTs,
        totalTransactions
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

const getDashboardData = () => {

    return {
        stats: getStats(),

        blockchain: getBlockchainStatus(),

        recentTransactions:
            transactionService.getRecentTransactions(5)
    };
};

module.exports = {
    getStats,
    getBlockchainStatus,
    getDashboardData
};