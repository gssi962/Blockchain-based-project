const fs = require("fs");
const grpc = require("@grpc/grpc-js");
const crypto = require("crypto");

const {
    connect,
    signers,
    hash
} = require("@hyperledger/fabric-gateway");

const { blockchainConfig } =
    require("../config/blockchain");

let gateway = null;
let client = null;
let contract = null;

/* =====================================================
   FABRIC ENDORSING ORGANIZATIONS
===================================================== */

const endorsingOrganizations = [
    "Org1MSP",
    "Org2MSP"
];

/* =====================================================
   FABRIC GATEWAY PEER
   We connect through Org2 so the Gateway discovery
   service can discover Org2's endorsing peer directly.
===================================================== */

const gatewayPeerName =
    "peer0.org1.example.com";

/* =====================================================
   CREATE / REUSE FABRIC GATEWAY CONNECTION
===================================================== */

const getGateway = async () => {

    if (gateway && contract) {
        return {
            gateway,
            contract
        };
    }

    const certPath =
        process.env.FABRIC_CERT_PATH;

    const keyPath =
        process.env.FABRIC_KEY_PATH;

    const connectionProfilePath =
        process.env.FABRIC_CONNECTION_PROFILE;

    /* ---------------------------------------------
       CONFIGURATION VALIDATION
    --------------------------------------------- */

    if (!certPath) {
        throw new Error(
            "FABRIC_CERT_PATH is not configured"
        );
    }

    if (!keyPath) {
        throw new Error(
            "FABRIC_KEY_PATH is not configured"
        );
    }

    if (!connectionProfilePath) {
        throw new Error(
            "FABRIC_CONNECTION_PROFILE is not configured"
        );
    }

    /* ---------------------------------------------
       FILE VALIDATION
    --------------------------------------------- */

    if (!fs.existsSync(certPath)) {
        throw new Error(
            `Fabric certificate not found: ${certPath}`
        );
    }

    if (!fs.existsSync(keyPath)) {
        throw new Error(
            `Fabric private key not found: ${keyPath}`
        );
    }

    if (!fs.existsSync(connectionProfilePath)) {
        throw new Error(
            `Fabric connection profile not found: ${connectionProfilePath}`
        );
    }

    /* ---------------------------------------------
       LOAD CONNECTION PROFILE
    --------------------------------------------- */

    const connectionProfile =
        JSON.parse(
            fs.readFileSync(
                connectionProfilePath,
                "utf8"
            )
        );

    /* =================================================
       SELECT ORG2 PEER
    ================================================= */

    const peer =
        connectionProfile.peers?.[
            gatewayPeerName
        ];

    if (!peer) {
        throw new Error(
            `Peer ${gatewayPeerName} not found in connection profile`
        );
    }

    if (!peer.url) {
        throw new Error(
            `Peer URL missing for ${gatewayPeerName}`
        );
    }

    /* ---------------------------------------------
       PEER ADDRESS
    --------------------------------------------- */

    const peerAddress =
        peer.url.replace(
            /^grpcs?:\/\//,
            ""
        );

    /* =================================================
       TLS ROOT CERTIFICATE
    ================================================= */

    let tlsRootCert;

    if (peer.tlsCACerts?.pem) {

        tlsRootCert =
            Buffer.from(
                peer.tlsCACerts.pem
            );

    } else if (
        peer.tlsCACerts?.path
    ) {

        if (
            !fs.existsSync(
                peer.tlsCACerts.path
            )
        ) {
            throw new Error(
                `Fabric TLS certificate not found: ${peer.tlsCACerts.path}`
            );
        }

        tlsRootCert =
            fs.readFileSync(
                peer.tlsCACerts.path
            );

    } else {

        throw new Error(
            `TLS CA certificate not configured for ${gatewayPeerName}`
        );
    }

    /* =================================================
       gRPC OPTIONS
    ================================================= */

    const grpcOptions =
        peer.grpcOptions || {};

    const sslTargetName =
        grpcOptions[
            "ssl-target-name-override"
        ] ||
        grpcOptions.hostnameOverride ||
        gatewayPeerName;

    /* =================================================
       gRPC CLIENT
    ================================================= */

    client =
        new grpc.Client(
            peerAddress,
            grpc.credentials.createSsl(
                tlsRootCert
            ),
            {
                "grpc.ssl_target_name_override":
                    sslTargetName,

                "grpc.default_authority":
                    sslTargetName
            }
        );

    /* =================================================
       FABRIC IDENTITY
    ================================================= */

    const certificate =
        fs.readFileSync(
            certPath
        );

    const privateKey =
        fs.readFileSync(
            keyPath
        );

    const identity = {

        mspId:
            process.env.FABRIC_MSP_ID ||
            blockchainConfig.mspId ||
            "Org1MSP",

        credentials:
            certificate
    };

    /* =================================================
       SIGNER
    ================================================= */

    const signer =
        signers.newPrivateKeySigner(
            crypto.createPrivateKey(
                privateKey
            )
        );

    /* =================================================
       FABRIC GATEWAY
    ================================================= */

  gateway = connect({
    client,
    identity,
    signer,
    hash: hash.sha256,
    discovery: {
        enabled: true,
        asLocalhost: true
    }
});

    /* =================================================
       NETWORK
    ================================================= */

    const network =
        gateway.getNetwork(
            blockchainConfig.channelName
        );

    /* =================================================
       CHAINCODE
    ================================================= */

    contract =
        network.getContract(
            blockchainConfig.chaincodeName
        );

    /* =================================================
       CONNECTION LOGS
    ================================================= */

    console.log(
        "========================================"
    );

    console.log(
        "Hyperledger Fabric Gateway Connected"
    );

    console.log(
        `Channel: ${
            blockchainConfig.channelName
        }`
    );

    console.log(
        `Chaincode: ${
            blockchainConfig.chaincodeName
        }`
    );

    console.log(
        `Identity MSP: ${
            identity.mspId
        }`
    );

    console.log(
        `Gateway Peer: ${
            gatewayPeerName
        }`
    );

    console.log(
        `Gateway Peer Address: ${
            peerAddress
        }`
    );

    console.log(
        `TLS Server Name: ${
            sslTargetName
        }`
    );

    console.log(
        `Endorsing Organizations: ${
            endorsingOrganizations.join(", ")
        }`
    );

    console.log(
        "Fabric Discovery: ENABLED"
    );

    console.log(
        "========================================"
    );

    return {
        gateway,
        contract
    };
};

/* =====================================================
   SUBMIT TRANSACTION
   Supports both:
   1. Object style
   2. Existing positional style used by assetService
===================================================== */

const submitTransaction = async (
    operationOrOptions,
    assetIdArg = null,
    userIdArg = null,
    nftIdArg = null,
    toUserArg = null
) => {

    let operation;
    let assetId;
    let userId;
    let nftId;
    let toUser;

    /* =================================================
       CREATE ASSET DATA
    ================================================= */

    let name = null;
    let description = null;
    let category = null;
    let fileHash = "";
    let storageReference = "";

    const isObjectStyle =
        typeof operationOrOptions === "object" &&
        operationOrOptions !== null;

    /* =================================================
       OBJECT ARGUMENT STYLE
    ================================================= */

    if (isObjectStyle) {

        operation =
            operationOrOptions.operation;

        assetId =
            operationOrOptions.assetId;

        userId =
            operationOrOptions.userId ??
            operationOrOptions.ownerDid ??
            null;

        nftId =
            operationOrOptions.nftId ??
            null;

        toUser =
            operationOrOptions.toUser ??
            null;

        name =
            operationOrOptions.name ??
            null;

        description =
            operationOrOptions.description ??
            null;

        category =
            operationOrOptions.category ??
            null;

        fileHash =
            operationOrOptions.fileHash ??
            "";

        storageReference =
            operationOrOptions.storageReference ??
            "";
    }

    /* =================================================
       POSITIONAL ARGUMENT STYLE
    ================================================= */

    else {

        operation =
            operationOrOptions;

        /* ---------------------------------------------
           CREATE ASSET
        --------------------------------------------- */

        if (
            operation ===
            "CREATE_ASSET"
        ) {

            assetId =
                assetIdArg;

            userId =
                userIdArg;

            nftId = null;
            toUser = null;
        }

        /* ---------------------------------------------
           MINT NFT
        --------------------------------------------- */

        else if (
            operation ===
            "MINT_NFT"
        ) {

            nftId =
                assetIdArg;

            assetId =
                userIdArg;

            userId =
                nftIdArg;

            toUser = null;
        }

        /* ---------------------------------------------
           TRANSFER ASSET
        --------------------------------------------- */

        else if (
            operation ===
            "TRANSFER_ASSET"
        ) {

            assetId =
                assetIdArg;

            toUser =
                userIdArg;

            userId = null;
            nftId = null;
        }

        /* ---------------------------------------------
           FALLBACK
        --------------------------------------------- */

        else {

            assetId =
                assetIdArg;

            userId =
                userIdArg;

            nftId =
                nftIdArg;

            toUser =
                toUserArg;
        }
    }

    /* =================================================
       GET FABRIC GATEWAY
    ================================================= */

    const {
        contract
    } = await getGateway();

    let transaction;

    /* =================================================
       CREATE ASSET
    ================================================= */

    if (
        operation ===
        "CREATE_ASSET"
    ) {

        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (!assetId) {
            throw new Error(
                "Asset ID is required for asset creation"
            );
        }

        if (!userId) {
            throw new Error(
                "Owner identity is required for asset creation"
            );
        }

        /* ---------------------------------------------
           DEFAULT VALUES
        --------------------------------------------- */

        const finalName =
            name ||
            `Asset-${assetId}`;

        const finalDescription =
            description ||
            "Crypta Shield Digital Asset";

        const finalCategory =
            category ||
            "DIGITAL";

        const finalFileHash =
            fileHash ||
            "";

        const finalStorageReference =
            storageReference ||
            "";

        /* ---------------------------------------------
           CREATE ASSET ON FABRIC

           Current channel policy requires both:
           Org1MSP + Org2MSP
        --------------------------------------------- */

        transaction =
            contract.submitAsync(
                "CreateAsset",
                {
                    endorsingOrganizations:
                        [
                            "Org1MSP",
                            "Org2MSP"
                        ],

                    arguments: [
                        String(
                            assetId
                        ),

                        String(
                            finalName
                        ),

                        String(
                            finalDescription
                        ),

                        String(
                            finalCategory
                        ),

                        String(
                            userId
                        ),

                        String(
                            finalFileHash
                        ),

                        String(
                            finalStorageReference
                        )
                    ]
                }
            );
    }

    /* =================================================
       MINT NFT
    ================================================= */

    else if (
        operation ===
        "MINT_NFT"
    ) {

        if (!nftId) {
            throw new Error(
                "NFT ID is required for NFT minting"
            );
        }

        if (!assetId) {
            throw new Error(
                "Asset ID is required for NFT minting"
            );
        }

        if (!userId) {
            throw new Error(
                "Owner identity is required for NFT minting"
            );
        }

        transaction =
            contract.submitAsync(
                "NFTContract:MintNFT",
                {
                    endorsingOrganizations:
                        [
                            "Org1MSP",
                            "Org2MSP"
                        ],

                    arguments: [
                        String(
                            nftId
                        ),

                        String(
                            assetId
                        ),

                        String(
                            userId
                        )
                    ]
                }
            );
    }

    /* =================================================
       TRANSFER ASSET
    ================================================= */

    else if (
        operation ===
        "TRANSFER_ASSET"
    ) {

        if (!assetId) {
            throw new Error(
                "Asset ID is required for asset transfer"
            );
        }

        if (!toUser) {
            throw new Error(
                "Recipient user is required for asset transfer"
            );
        }

        transaction =
            contract.submitAsync(
                "TransferAsset",
                {
                    endorsingOrganizations:
                        [
                            "Org1MSP",
                            "Org2MSP"
                        ],

                    arguments: [
                        String(
                            assetId
                        ),

                        String(
                            toUser
                        )
                    ]
                }
            );
    }

    /* =================================================
       UNSUPPORTED OPERATION
    ================================================= */

    else {

        throw new Error(
            `Unsupported Fabric operation: ${operation}`
        );
    }

    /* =================================================
       WAIT FOR ENDORSEMENT + SUBMISSION
    ================================================= */

    const result =
        await transaction;

    /* =================================================
       TRANSACTION ID
    ================================================= */

    const transactionId =
        result.getTransactionId();

    /* =================================================
       WAIT FOR COMMIT
    ================================================= */

    const commit =
        await result.getStatus();

    if (
        commit.code !== 0
    ) {

        console.error(
            "========================================"
        );

        console.error(
            "FABRIC COMMIT FAILED"
        );

        console.error(
            `Code: ${
                commit.code
            }`
        );

        console.error(
            `Message: ${
                commit.message ||
                "No message"
            }`
        );

        console.error(
            `Details: ${
                JSON.stringify(
                    commit.details || [],
                    null,
                    2
                )
            }`
        );

        console.error(
            "Full Commit Status:",
            commit
        );

        console.error(
            "========================================"
        );

        throw new Error(
            `Fabric transaction failed: ${
                commit.code
            } - ${
                commit.message ||
                "Unknown Fabric commit error"
            }`
        );
    }

    /* =================================================
       SUCCESS LOG
    ================================================= */

    console.log(
        "Fabric transaction committed successfully"
    );

    console.log(
        `Operation: ${
            operation
        }`
    );

    console.log(
        `Transaction ID: ${
            transactionId
        }`
    );

    /* =================================================
       CREATE ASSET FILE INFORMATION
    ================================================= */

    if (
        operation ===
        "CREATE_ASSET"
    ) {

        console.log(
            `File Hash: ${
                fileHash ||
                "NONE"
            }`
        );

        console.log(
            `Storage Reference: ${
                storageReference ||
                "NONE"
            }`
        );
    }

    /* =================================================
       RETURN RESULT
    ================================================= */

    return {

        success:
            true,

        connected:
            true,

        status:
            "CONFIRMED",

        blockchainTxId:
            transactionId,

        transactionId,

        network:
            blockchainConfig.networkName,

        channel:
            blockchainConfig.channelName,

        chaincode:
            blockchainConfig.chaincodeName,

        operation,

        assetId,

        userId,

        nftId,

        toUser,

        fileHash:
            fileHash ||
            null,

        storageReference:
            storageReference ||
            null
    };
};

/* =====================================================
   READ SINGLE ASSET FROM FABRIC
===================================================== */

const getAssetFromBlockchain = async (
    assetId
) => {

    if (!assetId) {
        throw new Error(
            "Asset ID is required"
        );
    }

    const {
        contract
    } = await getGateway();

    const result =
        await contract.evaluateTransaction(
            "ReadAsset",
            assetId
        );

    if (
        !result ||
        result.length === 0
    ) {
        return null;
    }

    return JSON.parse(
        Buffer
            .from(result)
            .toString("utf8")
    );
};

/* =====================================================
   READ ALL ASSETS FROM FABRIC
===================================================== */

const getAllAssetsFromBlockchain =
    async () => {

        const {
            contract
        } = await getGateway();

        const result =
            await contract.evaluateTransaction(
                "GetAllAssets"
            );

        if (
            !result ||
            result.length === 0
        ) {
            return [];
        }

        const parsed =
            JSON.parse(
                Buffer
                    .from(result)
                    .toString("utf8")
            );

        return Array.isArray(parsed)
            ? parsed
            : [];
    };

/* =====================================================
   READ SINGLE NFT FROM FABRIC
===================================================== */

const getNFTFromBlockchain = async (
    nftId
) => {

    if (!nftId) {
        throw new Error(
            "NFT ID is required"
        );
    }

    const {
        contract
    } = await getGateway();

    try {

        const result =
            await contract.evaluateTransaction(
                "NFTContract:ReadNFT",
                nftId
            );

        if (
            !result ||
            result.length === 0
        ) {
            return null;
        }

        return JSON.parse(
            Buffer
                .from(result)
                .toString("utf8")
        );

    } catch (error) {

        console.error(
            `NFT read failed for ${nftId}:`,
            error.message
        );

        return null;
    }
};

/* =====================================================
   READ ALL NFTs FROM FABRIC
===================================================== */

const getAllNFTsFromBlockchain =
    async () => {

        const {
            contract
        } = await getGateway();

        try {

            const result =
                await contract.evaluateTransaction(
                    "NFTContract:GetAllNFTs"
                );

            if (
                !result ||
                result.length === 0
            ) {
                return [];
            }

            const parsed =
                JSON.parse(
                    Buffer
                        .from(result)
                        .toString("utf8")
                );

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                "Fabric NFT list read failed:",
                error.message
            );

            return [];
        }
    };

/* =====================================================
   CHECK NFT EXISTENCE
===================================================== */

const isNFTMinted =
    async (
        nftId
    ) => {

        if (!nftId) {
            return false;
        }

        try {

            const nft =
                await getNFTFromBlockchain(
                    nftId
                );

            return !!nft;

        } catch (error) {

            console.error(
                "NFT existence check failed:",
                error.message
            );

            return false;
        }
    };

/* =====================================================
   CHECK FABRIC BLOCKCHAIN STATUS
===================================================== */

const getBlockchainStatus =
    async () => {

        try {

            await getGateway();

            return {

                connected:
                    true,

                status:
                    "ONLINE",

                operational:
                    true,

                network:
                    blockchainConfig.networkName,

                channel:
                    blockchainConfig.channelName,

                chaincode:
                    blockchainConfig.chaincodeName
            };

        } catch (error) {

            console.error(
                "Fabric status check failed:",
                error.message
            );

            return {

                connected:
                    false,

                status:
                    "NOT CONNECTED",

                operational:
                    false,

                network:
                    blockchainConfig.networkName,

                channel:
                    blockchainConfig.channelName,

                chaincode:
                    blockchainConfig.chaincodeName,

                error:
                    error.message
            };
        }
    };

/* =====================================================
   CLOSE FABRIC GATEWAY
===================================================== */

const disconnect = () => {

    try {

        if (gateway) {

            gateway.close();

            gateway = null;
        }

        if (client) {

            client.close();

            client = null;
        }

        contract = null;

        console.log(
            "Hyperledger Fabric Gateway disconnected"
        );

    } catch (error) {

        console.error(
            "Fabric disconnect error:",
            error.message
        );
    }
};

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {

    submitTransaction,

    getAssetFromBlockchain,

    getAllAssetsFromBlockchain,

    getNFTFromBlockchain,

    getAllNFTsFromBlockchain,

    isNFTMinted,

    getBlockchainStatus,

    disconnect
};