const { store } = require("../config/database");

const Asset = require("../models/Asset");
const Transaction = require("../models/Transaction");

const blockchainService =
    require("./blockchainService");

const didService =
    require("./didService");

const auditService =
    require("./auditService");

const {
    createId
} = require("../utils/constants");

const getAllAssets = async () => {
    return [...store.assets].reverse();
};

const getAssetById = async (id) => {
    return store.assets.find(
        asset => asset.id === id
    );
};

const createAsset = async ({
    name,
    description,
    category,
    createdBy
}) => {

    const assetId = createId("asset");

    const blockchainResult =
        await blockchainService.submitTransaction({
            operation: "CREATE_ASSET",
            assetId,
            userId: createdBy
        });

    const asset = new Asset({
        id: assetId,
        name,
        description,
        category,
        ownerId: createdBy,
        blockchainId:
            blockchainResult.blockchainTxId,
        createdBy
    });

    store.assets.push(asset);

    const transaction =
        new Transaction({
            id: createId("tx"),
            operation: "CREATE_ASSET",
            assetId: asset.id,
            initiatedBy: createdBy,
            status: "CONFIRMED",
            blockchainTxId:
                blockchainResult.blockchainTxId
        });

    store.transactions.push(transaction);

    const user = store.users.find(
        item => item.id === createdBy
    );

    auditService.createAuditLog({
        action: "CREATE_ASSET",
        category: "ASSET",
        description:
            `Asset ${asset.name} created`,
        performedBy: user,
        metadata: {
            assetId: asset.id
        }
    });

    return asset;
};

const transferAsset = async ({
    assetId,
    fromUser,
    toUser
}) => {

    const asset =
        await getAssetById(assetId);

    if (!asset) {
        throw new Error("Asset not found");
    }

    const recipient = store.users.find(
        user => user.id === toUser
    );

    if (!recipient) {
        throw new Error(
            "Recipient user not found"
        );
    }

    const blockchainResult =
        await blockchainService.submitTransaction({
            operation: "TRANSFER_ASSET",
            assetId,
            userId: fromUser
        });

    asset.ownerId = toUser;

    const transaction =
        new Transaction({
            id: createId("tx"),
            operation: "TRANSFER_ASSET",
            assetId,
            initiatedBy: fromUser,
            fromUser,
            toUser,
            status: "CONFIRMED",
            blockchainTxId:
                blockchainResult.blockchainTxId
        });

    store.transactions.push(transaction);

    const user = store.users.find(
        item => item.id === fromUser
    );

    auditService.createAuditLog({
        action: "TRANSFER_ASSET",
        category: "ASSET",
        description:
            `Asset ${asset.name} transferred`,
        performedBy: user,
        metadata: {
            assetId,
            fromUser,
            toUser
        }
    });

    return {
        asset,
        transaction
    };
};

module.exports = {
    getAllAssets,
    getAssetById,
    createAsset,
    transferAsset
};