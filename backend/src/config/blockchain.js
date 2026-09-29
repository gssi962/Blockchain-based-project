const path = require("path");

// =====================================================
// HYPERLEDGER FABRIC CONFIGURATION
// =====================================================

const blockchainConfig = {
    networkName: "crypta-network",

    channelName:
        process.env.FABRIC_CHANNEL ||
        "crypta-channel",

    chaincodeName:
        process.env.FABRIC_CHAINCODE ||
        "crypta-contract",

    mspId:
        process.env.FABRIC_MSP_ID ||
        "Org1MSP",

    peerEndpoint:
        process.env.FABRIC_PEER_ENDPOINT ||
        "localhost:7051",

    ordererEndpoint:
        process.env.FABRIC_ORDERER_ENDPOINT ||
        "localhost:7050",

    connectionProfilePath:
        process.env.FABRIC_CONNECTION_PROFILE ||
        path.join(
            __dirname,
            "../../blockchain/connection/connection-profile.json"
        ),

    walletPath:
        process.env.FABRIC_WALLET_PATH ||
        path.join(
            __dirname,
            "../../blockchain/wallet"
        ),

    identity:
        process.env.FABRIC_IDENTITY ||
        "admin"
};

module.exports = {
    blockchainConfig
};