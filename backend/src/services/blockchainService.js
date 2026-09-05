const crypto = require("crypto");

const submitTransaction = async ({
    operation,
    assetId,
    userId
}) => {

    const blockchainTxId =
        `fabric-${crypto.randomUUID()}`;

    return {
        success: true,
        blockchainTxId,
        network: "Hyperledger Fabric",
        channel: "crypta-channel",
        operation,
        assetId,
        userId,
        timestamp: new Date().toISOString()
    };
};

const getNetworkStatus = async () => {

    return {
        status: "ONLINE",
        network: "Hyperledger Fabric",
        channel: "crypta-channel",
        consensus: "Raft"
    };
};

module.exports = {
    submitTransaction,
    getNetworkStatus
};