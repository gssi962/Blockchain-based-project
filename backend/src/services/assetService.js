const { pool, store } = require("../config/database");
const Asset = require("../models/Asset");
const Transaction = require("../models/Transaction");
const blockchainService = require("./blockchainService");

const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const isRealNft = (nftId) => {
    if (!nftId) return false;

    const value = String(nftId).trim().toUpperCase();

    return (
        value !== "" &&
        value !== "NFT-PENDING" &&
        value !== "PENDING" &&
        value !== "NULL" &&
        value !== "UNDEFINED"
    );
};

// ---------------------------------------------------------
// FILE HASH HELPER
// ---------------------------------------------------------
//
// Generates SHA-256 hash from the ACTUAL uploaded file.
//
// This hash is used to verify that the document stored
// off-chain has not been modified.
//
// ---------------------------------------------------------

const calculateFileHash = async (filePath) => {

    if (!filePath) {
        return null;
    }

    if (!fs.existsSync(filePath)) {
        throw new Error(
            "Uploaded file was not found on server"
        );
    }

    return new Promise((resolve, reject) => {

        const hash =
            crypto.createHash("sha256");

        const stream =
            fs.createReadStream(filePath);

        stream.on(
            "data",
            (chunk) => {
                hash.update(chunk);
            }
        );

        stream.on(
            "end",
            () => {
                resolve(
                    hash.digest("hex")
                );
            }
        );

        stream.on(
            "error",
            (error) => {
                reject(error);
            }
        );
    });
};

// ---------------------------------------------------------
// STORAGE REFERENCE HELPER
// ---------------------------------------------------------
//
// Only a relative/private reference is stored.
//
// Absolute server paths are NEVER stored in Fabric/MySQL.
//
// Example:
//
// assets/asset-12345-document.pdf
//
// ---------------------------------------------------------

const createStorageReference = (
    storageFileName
) => {

    if (!storageFileName) {
        return null;
    }

    return path
        .posix
        .join(
            "assets",
            path.basename(
                storageFileName
            )
        );
};

// ---------------------------------------------------------
// OWNER DETAILS HELPER
// ---------------------------------------------------------
//
// Owner can come from:
// 1. User DID
// 2. User ID
//
// This helper resolves both so frontend can receive:
//
// ownerId
// ownerName
// ownerDid
// ownerEmail
//
// ---------------------------------------------------------

const getOwnerByIdOrDid = async (ownerValue) => {

    if (
        ownerValue === null ||
        ownerValue === undefined ||
        String(ownerValue).trim() === ""
    ) {
        return null;
    }

    const value = String(ownerValue).trim();

    try {

        const [rows] = await pool.execute(
            `
            SELECT
                id,
                name,
                email,
                did
            FROM users
            WHERE did = ?
               OR CAST(id AS CHAR) = ?
            LIMIT 1
            `,
            [
                value,
                value
            ]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0];

    } catch (error) {

        console.error(
            "Owner lookup failed:",
            error.message
        );

        return null;
    }
};

// ---------------------------------------------------------
// APPLY OWNER DETAILS
// ---------------------------------------------------------

const attachOwnerDetails = async (asset) => {

    if (!asset) {
        return asset;
    }

    const ownerValue =
        asset.ownerId ||
        asset.ownerDid ||
        null;

    const owner =
        await getOwnerByIdOrDid(
            ownerValue
        );

    if (!owner) {

        return {
            ...asset,

            ownerName:
                asset.ownerName ||
                null,

            ownerDid:
                asset.ownerDid ||
                (
                    asset.ownerId
                        ? String(asset.ownerId)
                        : null
                )
        };
    }

    return {
        ...asset,

        ownerId:
            owner.id,

        ownerName:
            owner.name ||
            null,

        ownerDid:
            owner.did ||
            asset.ownerDid ||
            null,

        ownerEmail:
            owner.email ||
            null
    };
};

// ---------------------------------------------------------
// TRANSACTION DATABASE HELPER
// ---------------------------------------------------------

const saveTransactionToDatabase = async ({
    id,
    operation,
    assetId = null,
    initiatedBy = null,
    fromUser = null,
    toUser = null,
    status = "CONFIRMED",
    blockchainTxId = null
}) => {

    try {

        await pool.execute(
            `
            INSERT INTO transactions (
                id,
                operation,
                asset_id,
                initiated_by,
                from_user,
                to_user,
                status,
                blockchain_tx_id,
                timestamp
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `,
            [
                id,
                operation,
                assetId,
                initiatedBy,
                fromUser,
                toUser,
                status,
                blockchainTxId
            ]
        );

        return true;

    } catch (error) {

        if (
            error.code ===
            "ER_DUP_ENTRY"
        ) {
            return true;
        }

        console.error(
            "Transaction database save failed:",
            error.message
        );

        return false;
    }
};

// ---------------------------------------------------------
// SAVE ASSET TO DATABASE
// ---------------------------------------------------------

const saveAssetToDatabase = async (asset) => {

    try {

        await pool.execute(
            `
            INSERT INTO assets (
                id,
                name,
                description,
                category,
                owner_id,
                nft_id,
                status,
                blockchain_id,
                created_by,
                created_at,
                file_hash,
                file_name,
                file_type,
                file_size,
                storage_reference,
                storage_file_name
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                description = VALUES(description),
                category = VALUES(category),
                owner_id = VALUES(owner_id),
                nft_id = VALUES(nft_id),
                status = VALUES(status),
                blockchain_id = VALUES(blockchain_id),
                file_hash = VALUES(file_hash),
                file_name = VALUES(file_name),
                file_type = VALUES(file_type),
                file_size = VALUES(file_size),
                storage_reference = VALUES(storage_reference),
                storage_file_name = VALUES(storage_file_name)
            `,
            [
                asset.id,
                asset.name,
                asset.description || "",
                asset.category || "General",
                asset.ownerId,
                asset.nftId,
                asset.status || "ACTIVE",
                asset.blockchainId,
                asset.createdBy,
                asset.createdAt,

                asset.fileHash ||
                    null,

                asset.fileName ||
                    null,

                asset.fileType ||
                    null,

                asset.fileSize ||
                    null,

                asset.storageReference ||
                    null,

                asset.storageFileName ||
                    null
            ]
        );

        return true;

    } catch (error) {

        console.error(
            "Asset database save failed:",
            error.message
        );

        return false;
    }
};

// ---------------------------------------------------------
// GET ALL ASSETS
// ---------------------------------------------------------

const getAllAssets = async () => {

    try {

        // -------------------------------------------------
        // STEP 1: GET ALL DATABASE ASSETS
        // -------------------------------------------------

        const [rows] = await pool.execute(
            `
            SELECT
                id,
                name,
                description,
                category,
                owner_id,
                nft_id,
                status,
                blockchain_id,
                created_by,
                created_at,
                file_hash,
                file_name,
                file_type,
                file_size,
                storage_reference,
                storage_file_name
            FROM assets
            ORDER BY created_at DESC
            `
        );

        // -------------------------------------------------
        // STEP 2: GET ACTUAL FABRIC ASSETS
        // -------------------------------------------------

        let blockchainAssets = [];

        try {

            blockchainAssets =
                await blockchainService
                    .getAllAssetsFromBlockchain();

            if (
                !Array.isArray(
                    blockchainAssets
                )
            ) {
                blockchainAssets = [];
            }

        } catch (fabricError) {

            console.error(
                "Fabric asset loading failed:",
                fabricError.message
            );

            blockchainAssets = [];
        }

        // -------------------------------------------------
        // STEP 3: GET ACTUAL FABRIC NFTs
        // -------------------------------------------------

        let blockchainNFTs = [];

        try {

            blockchainNFTs =
                await blockchainService
                    .getAllNFTsFromBlockchain();

            if (
                !Array.isArray(
                    blockchainNFTs
                )
            ) {
                blockchainNFTs = [];
            }

        } catch (fabricNFTError) {

            console.error(
                "Fabric NFT loading failed:",
                fabricNFTError.message
            );

            blockchainNFTs = [];
        }

        // -------------------------------------------------
        // STEP 4: MERGE MYSQL + FABRIC
        // -------------------------------------------------

        const assets = [];

        for (const row of rows) {

            const matchingFabricAsset =
                blockchainAssets.find(
                    (fabricAsset) => {

                        const fabricId =
                            fabricAsset?.assetId ||
                            fabricAsset?.id;

                        const databaseBlockchainId =
                            row.blockchain_id;

                        const databaseId =
                            row.id;

                        return (
                            String(
                                fabricId || ""
                            ) ===
                            String(
                                databaseBlockchainId || ""
                            ) ||

                            String(
                                fabricId || ""
                            ) ===
                            String(
                                databaseId || ""
                            )
                        );
                    }
                );

            const fabricAssetId =
                matchingFabricAsset?.assetId ||
                matchingFabricAsset?.id ||
                row.blockchain_id ||
                row.id;

            const matchingFabricNFT =
                blockchainNFTs.find(
                    (fabricNFT) => {

                        const nftAssetId =
                            fabricNFT?.assetId ||
                            fabricNFT?.asset_id;

                        return (
                            String(
                                nftAssetId || ""
                            ) ===
                            String(
                                fabricAssetId || ""
                            )
                        );
                    }
                );

            const nftId =
                row.nft_id ||
                matchingFabricNFT?.nftId ||
                matchingFabricNFT?.nft_id ||
                matchingFabricAsset?.nftId ||
                matchingFabricAsset?.nft_id ||
                null;

            if (!isRealNft(nftId)) {
                continue;
            }

            const blockchainId =
                row.blockchain_id ||
                matchingFabricAsset?.assetId ||
                matchingFabricAsset?.id ||
                row.id;

            const asset = {

                id:
                    row.id,

                assetId:
                    matchingFabricAsset?.assetId ||
                    matchingFabricAsset?.id ||
                    row.blockchain_id ||
                    row.id,

                name:
                    matchingFabricAsset?.name ||
                    row.name,

                description:
                    matchingFabricAsset?.description ||
                    row.description ||
                    "",

                category:
                    matchingFabricAsset?.category ||
                    row.category ||
                    "General",

                ownerId:
                    matchingFabricNFT?.ownerId ||
                    matchingFabricNFT?.owner_id ||
                    matchingFabricAsset?.ownerId ||
                    row.owner_id,

                ownerDid:
                    matchingFabricNFT?.ownerId ||
                    matchingFabricNFT?.owner_id ||
                    matchingFabricAsset?.ownerDid ||
                    matchingFabricAsset?.ownerId ||
                    null,

                nftId,

                status:
                    matchingFabricNFT?.status ||
                    matchingFabricAsset?.status ||
                    row.status ||
                    "ACTIVE",

                blockchainId,

                createdBy:
                    row.created_by,

                createdAt:
                    matchingFabricAsset?.createdAt ||
                    row.created_at,

                // -----------------------------------------
                // OFF-CHAIN FILE DATA
                // -----------------------------------------

                fileHash:
                    row.file_hash ||
                    null,

                fileName:
                    row.file_name ||
                    null,

                fileType:
                    row.file_type ||
                    null,

                fileSize:
                    row.file_size ||
                    null,

                storageReference:
                    row.storage_reference ||
                    null,

                storageFileName:
                    row.storage_file_name ||
                    null,

                // Frontend compatibility
                blockchainConnected:
                    true,

                blockchainStatus:
                    "CONNECTED",

                nftStatus:
                    "MINTED"
            };

            const assetWithOwner =
                await attachOwnerDetails(
                    asset
                );

            assets.push(
                assetWithOwner
            );

            // -------------------------------------------------
            // SYNC NFT INTO MYSQL
            // -------------------------------------------------

            if (
                isRealNft(nftId) &&
                String(
                    row.nft_id || ""
                ) !==
                String(
                    nftId
                )
            ) {

                try {

                    await pool.execute(
                        `
                        UPDATE assets
                        SET
                            nft_id = ?,
                            blockchain_id = ?
                        WHERE id = ?
                        `,
                        [
                            nftId,
                            blockchainId,
                            row.id
                        ]
                    );

                } catch (syncError) {

                    console.error(
                        "NFT database sync failed:",
                        syncError.message
                    );
                }
            }

            // -------------------------------------------------
            // SYNC OWNER ID
            // -------------------------------------------------

            if (
                assetWithOwner.ownerId &&
                String(
                    row.owner_id || ""
                ) !==
                String(
                    assetWithOwner.ownerId
                )
            ) {

                try {

                    await pool.execute(
                        `
                        UPDATE assets
                        SET owner_id = ?
                        WHERE id = ?
                        `,
                        [
                            assetWithOwner.ownerId,
                            row.id
                        ]
                    );

                } catch (ownerSyncError) {

                    console.error(
                        "Owner database sync failed:",
                        ownerSyncError.message
                    );
                }
            }
        }

        // -------------------------------------------------
        // STEP 5:
        // FABRIC ASSETS NOT IN MYSQL
        // -------------------------------------------------
        if (false) {
        for (
            const fabricAsset
            of blockchainAssets
        ) {

            const fabricAssetId =
                fabricAsset?.assetId ||
                fabricAsset?.id;

            const matchingFabricNFT =
                blockchainNFTs.find(
                    (fabricNFT) => {

                        const nftAssetId =
                            fabricNFT?.assetId ||
                            fabricNFT?.asset_id;

                        return (
                            String(
                                nftAssetId || ""
                            ) ===
                            String(
                                fabricAssetId || ""
                            )
                        );
                    }
                );

            const fabricNftId =
                matchingFabricNFT?.nftId ||
                matchingFabricNFT?.nft_id ||
                fabricAsset?.nftId ||
                fabricAsset?.nft_id ||
                null;

            if (
                !fabricAssetId ||
                !isRealNft(fabricNftId)
            ) {
                continue;
            }

            const alreadyExists =
                assets.some(
                    (asset) =>
                        String(
                            asset.assetId
                        ) ===
                        String(
                            fabricAssetId
                        )
                );

            if (alreadyExists) {
                continue;
            }

            const fabricOwnerId =
                matchingFabricNFT?.ownerId ||
                matchingFabricNFT?.owner_id ||
                fabricAsset.ownerId ||
                null;

            const fabricOwner =
                await getOwnerByIdOrDid(
                    fabricOwnerId
                );

            assets.push({

                id:
                    fabricAssetId,

                assetId:
                    fabricAssetId,

                name:
                    fabricAsset.name ||
                    `Blockchain Asset ${fabricAssetId}`,

                description:
                    fabricAsset.description ||
                    "",

                category:
                    fabricAsset.category ||
                    "DIGITAL",

                ownerId:
                    fabricOwner?.id ||
                    fabricOwnerId ||
                    null,

                ownerName:
                    fabricOwner?.name ||
                    null,

                ownerDid:
                    fabricOwner?.did ||
                    (
                        fabricOwnerId
                            ? String(
                                fabricOwnerId
                            )
                            : null
                    ),

                ownerEmail:
                    fabricOwner?.email ||
                    null,

                nftId:
                    fabricNftId,

                status:
                    matchingFabricNFT?.status ||
                    fabricAsset.status ||
                    "ACTIVE",

                blockchainId:
                    fabricAssetId,

                createdBy:
                    fabricAsset.createdBy ||
                    null,

                createdAt:
                    fabricAsset.createdAt ||
                    null,

                // Fabric-only assets may not have
                // off-chain file metadata.
                fileHash:
                    fabricAsset.fileHash ||
                    null,

                fileName:
                    null,

                fileType:
                    null,

                fileSize:
                    null,

                storageReference:
                    fabricAsset.storageReference ||
                    null,

                storageFileName:
                    null,

                blockchainConnected:
                    true,

                blockchainStatus:
                    "CONNECTED",

                nftStatus:
                    "MINTED"
            });
        }
    }

        // -------------------------------------------------
        // STEP 6:
        // KEEP MEMORY STORE SYNCHRONIZED
        // -------------------------------------------------

        store.assets =
            assets;

        return assets;

    } catch (error) {

        console.error(
            "getAllAssets failed:",
            error.message
        );

        return (
            store.assets || []
        ).filter(
            (asset) =>
                isRealNft(
                    asset.nftId
                )
        );
    }
};

// ---------------------------------------------------------
// GET SINGLE ASSET
// ---------------------------------------------------------

const getAssetById = async (id) => {

    try {

        const [rows] =
            await pool.execute(
                `
                SELECT
                    id,
                    name,
                    description,
                    category,
                    owner_id,
                    nft_id,
                    status,
                    blockchain_id,
                    created_by,
                    created_at,
                    file_hash,
                    file_name,
                    file_type,
                    file_size,
                    storage_reference,
                    storage_file_name
                FROM assets
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );

        if (rows.length === 0) {
            return null;
        }

        const row =
            rows[0];

        if (
            !isRealNft(
                row.nft_id
            )
        ) {

            try {

                const fabricAsset =
                    await blockchainService
                        .getAssetFromBlockchain(
                            id
                        );

                if (fabricAsset) {

                    let fabricNft =
                        null;

                    try {

                        const allNFTs =
                            await blockchainService
                                .getAllNFTsFromBlockchain();

                        if (
                            Array.isArray(
                                allNFTs
                            )
                        ) {

                            fabricNft =
                                allNFTs.find(
                                    (item) =>
                                        String(
                                            item?.assetId ||
                                            item?.asset_id ||
                                            ""
                                        ) ===
                                        String(
                                            fabricAsset?.assetId ||
                                            fabricAsset?.id ||
                                            id
                                        )
                                );
                        }

                    } catch (
                        nftListError
                    ) {

                        console.error(
                            "Single asset NFT list lookup failed:",
                            nftListError.message
                        );
                    }

                    if (!fabricNft) {

                        const possibleNftId =
                            fabricAsset.nftId ||
                            fabricAsset.nft_id ||
                            null;

                        if (
                            isRealNft(
                                possibleNftId
                            )
                        ) {

                            fabricNft =
                                await blockchainService
                                    .getNFTFromBlockchain(
                                        possibleNftId
                                    );
                        }
                    }

                    const fabricNftId =
                        fabricNft?.nftId ||
                        fabricNft?.nft_id ||
                        fabricAsset.nftId ||
                        fabricAsset.nft_id ||
                        null;

                    if (
                        isRealNft(
                            fabricNftId
                        )
                    ) {

                        const blockchainId =
                            row.blockchain_id ||
                            fabricAsset.assetId ||
                            fabricAsset.id ||
                            row.id;

                        try {

                            await pool.execute(
                                `
                                UPDATE assets
                                SET
                                    nft_id = ?,
                                    blockchain_id = ?
                                WHERE id = ?
                                `,
                                [
                                    fabricNftId,
                                    blockchainId,
                                    row.id
                                ]
                            );

                        } catch (
                            syncError
                        ) {

                            console.error(
                                "Single asset NFT database sync failed:",
                                syncError.message
                            );
                        }

                        const singleAsset = {

                            id:
                                row.id,

                            assetId:
                                fabricAsset.assetId ||
                                fabricAsset.id ||
                                row.id,

                            name:
                                fabricAsset.name ||
                                row.name,

                            description:
                                fabricAsset.description ||
                                row.description ||
                                "",

                            category:
                                fabricAsset.category ||
                                row.category ||
                                "General",

                            ownerId:
                                fabricNft?.ownerId ||
                                fabricNft?.owner_id ||
                                fabricAsset.ownerId ||
                                row.owner_id,

                            ownerDid:
                                fabricNft?.ownerId ||
                                fabricNft?.owner_id ||
                                fabricAsset.ownerDid ||
                                fabricAsset.ownerId ||
                                null,

                            nftId:
                                fabricNftId,

                            status:
                                fabricNft?.status ||
                                fabricAsset.status ||
                                row.status ||
                                "ACTIVE",

                            blockchainId,

                            createdBy:
                                row.created_by,

                            createdAt:
                                fabricAsset.createdAt ||
                                row.created_at,

                            // ---------------------------------
                            // OFF-CHAIN FILE DATA
                            // ---------------------------------

                            fileHash:
                                row.file_hash ||
                                fabricAsset.fileHash ||
                                null,

                            fileName:
                                row.file_name ||
                                null,

                            fileType:
                                row.file_type ||
                                null,

                            fileSize:
                                row.file_size ||
                                null,

                            storageReference:
                                row.storage_reference ||
                                fabricAsset.storageReference ||
                                null,

                            storageFileName:
                                row.storage_file_name ||
                                null,

                            blockchainConnected:
                                true,

                            blockchainStatus:
                                "CONNECTED",

                            nftStatus:
                                "MINTED"
                        };

                        const assetWithOwner =
                            await attachOwnerDetails(
                                singleAsset
                            );

                        if (
                            assetWithOwner.ownerId &&
                            String(
                                row.owner_id || ""
                            ) !==
                            String(
                                assetWithOwner.ownerId
                            )
                        ) {

                            try {

                                await pool.execute(
                                    `
                                    UPDATE assets
                                    SET owner_id = ?
                                    WHERE id = ?
                                    `,
                                    [
                                        assetWithOwner.ownerId,
                                        row.id
                                    ]
                                );

                            } catch (
                                ownerSyncError
                            ) {

                                console.error(
                                    "Single asset owner sync failed:",
                                    ownerSyncError.message
                                );
                            }
                        }

                        return assetWithOwner;
                    }
                }

            } catch (
                fabricError
            ) {

                console.error(
                    "Single Fabric asset lookup failed:",
                    fabricError.message
                );
            }

            return null;
        }

        const localAsset = {

            id:
                row.id,

            assetId:
                row.blockchain_id ||
                row.id,

            name:
                row.name,

            description:
                row.description ||
                "",

            category:
                row.category ||
                "General",

            ownerId:
                row.owner_id,

            nftId:
                row.nft_id,

            status:
                row.status ||
                "ACTIVE",

            blockchainId:
                row.blockchain_id,

            createdBy:
                row.created_by,

            createdAt:
                row.created_at,

            // ---------------------------------------------
            // OFF-CHAIN FILE DATA
            // ---------------------------------------------

            fileHash:
                row.file_hash ||
                null,

            fileName:
                row.file_name ||
                null,

            fileType:
                row.file_type ||
                null,

            fileSize:
                row.file_size ||
                null,

            storageReference:
                row.storage_reference ||
                null,

            storageFileName:
                row.storage_file_name ||
                null,

            blockchainConnected:
                true,

            blockchainStatus:
                "CONNECTED",

            nftStatus:
                "MINTED"
        };

        return await attachOwnerDetails(
            localAsset
        );

    } catch (error) {

        console.error(
            "getAssetById failed:",
            error.message
        );

        const asset =
            (store.assets || []).find(
                (item) =>
                    String(
                        item.id
                    ) ===
                    String(
                        id
                    )
            );

        if (
            !asset ||
            !isRealNft(
                asset.nftId
            )
        ) {
            return null;
        }

        return await attachOwnerDetails(
            asset
        );
    }
};

// ---------------------------------------------------------
// OWNER LOOKUP BY DID
// ---------------------------------------------------------

const getOwnerByDid = async (
    ownerDid
) => {

    const [rows] =
        await pool.execute(
            `
            SELECT
                id,
                name,
                email,
                did
            FROM users
            WHERE did = ?
            LIMIT 1
            `,
            [ownerDid]
        );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
};

// ---------------------------------------------------------
// CREATE ASSET
// ---------------------------------------------------------
//
// Flow:
//
// Actual document
//       ↓
// SHA-256 hash
//       ↓
// CREATE_ASSET on Fabric
//       ↓
// MINT_NFT on Fabric
//       ↓
// Save asset + file metadata in MySQL
//       ↓
// Save transactions
//
// ---------------------------------------------------------

const createAsset = async ({
    name,
    description = "",
    category = "General",
    value = 0,
    ownerDid,
    createdBy,

    filePath = null,
    fileName = null,
    fileType = null,
    fileSize = null,
    storageFileName = null
}) => {

    if (
        !name ||
        !String(name).trim()
    ) {

        throw new Error(
            "Asset name is required"
        );
    }

    if (
        !ownerDid ||
        !String(ownerDid).trim()
    ) {

        throw new Error(
            "Owner DID is required"
        );
    }

    if (!createdBy) {

        throw new Error(
            "Created by is required"
        );
    }

    if (!filePath) {

        throw new Error(
            "Document file is required"
        );
    }

    if (
        !fs.existsSync(
            filePath
        )
    ) {

        throw new Error(
            "Uploaded document was not found"
        );
    }

    const owner =
        await getOwnerByDid(
            ownerDid
        );

    if (!owner) {

        throw new Error(
            "Owner DID not found"
        );
    }

    // -------------------------------------------------
    // STEP 0: CALCULATE ACTUAL FILE HASH
    // -------------------------------------------------

    const fileHash =
        await calculateFileHash(
            filePath
        );

    // -------------------------------------------------
    // CREATE PRIVATE STORAGE REFERENCE
    // -------------------------------------------------

    const finalStorageFileName =
        storageFileName ||
        path.basename(
            filePath
        );

    const storageReference =
        createStorageReference(
            finalStorageFileName
        );

    const assetId =
        `asset-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;

    const nftId =
        `nft-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;

    // -------------------------------------------------
    // STEP 1: CREATE ASSET ON FABRIC
    // -------------------------------------------------
    //
    // The blockchain service receives the file hash
    // and private storage reference.
    //
    // These values are passed to AssetContract's
    // CreateAsset transaction.
    //
    // -------------------------------------------------

    const assetTx =
        await blockchainService.submitTransaction({

            operation:
                "CREATE_ASSET",

            assetId,

            name:
                String(name).trim(),

            description:
                String(
                    description || ""
                ).trim(),

            category:
                category ||
                "General",

            ownerDid,

            fileHash,

            storageReference
        });

    if (
        !assetTx ||
        !assetTx.success
    ) {

        throw new Error(
            "Blockchain asset creation failed"
        );
    }

    // -------------------------------------------------
    // STEP 2: MINT NFT ON FABRIC
    // -------------------------------------------------

    const nftTx =
        await blockchainService.submitTransaction(
            "MINT_NFT",
            nftId,
            assetId,
            ownerDid
        );

    if (
        !nftTx ||
        !nftTx.success
    ) {

        console.error(
            "NFT mint failed for asset:",
            assetId
        );

        throw new Error(
            "Asset was created on blockchain but NFT mint failed. Asset will not be shown until NFT is successfully minted."
        );
    }

    // -------------------------------------------------
    // STEP 3: CREATE LOCAL ASSET
    // -------------------------------------------------

    const createdAt =
        new Date();

    const asset =
        new Asset({

            id:
                assetId,

            name:
                String(
                    name
                ).trim(),

            description:
                String(
                    description || ""
                ).trim(),

            category,

            ownerId:
                owner.id,

            nftId,

            status:
                "ACTIVE",

            blockchainId:
                assetTx.blockchainTxId ||
                assetTx.transactionId ||
                assetTx.blockchainId ||
                assetId,

            createdBy,

            createdAt
        });

    // -------------------------------------------------
    // OWNER DATA
    // -------------------------------------------------

    asset.ownerDid =
        owner.did ||
        ownerDid;

    asset.ownerName =
        owner.name;

    asset.ownerEmail =
        owner.email;

    // -------------------------------------------------
    // VALUE
    // -------------------------------------------------

    asset.value =
        Number(value) || 0;

    // -------------------------------------------------
    // OFF-CHAIN FILE DATA
    // -------------------------------------------------

    asset.fileHash =
        fileHash;

    asset.fileName =
        fileName;

    asset.fileType =
        fileType;

    asset.fileSize =
        fileSize;

    asset.storageReference =
        storageReference;

    asset.storageFileName =
        finalStorageFileName;

    // -------------------------------------------------
    // BLOCKCHAIN STATUS
    // -------------------------------------------------

    asset.blockchainConnected =
        true;

    asset.blockchainStatus =
        "CONNECTED";

    asset.nftStatus =
        "MINTED";

    // -------------------------------------------------
    // STEP 4: SAVE ASSET TO MYSQL
    // -------------------------------------------------

    const saved =
        await saveAssetToDatabase(
            asset
        );

    if (!saved) {

        throw new Error(
            "Asset was created on blockchain but could not be saved to database"
        );
    }

    // -------------------------------------------------
    // MEMORY STORE
    // -------------------------------------------------

    store.assets = [

        ...(store.assets || [])
            .filter(
                (item) =>
                    String(
                        item.id
                    ) !==
                    String(
                        asset.id
                    )
            ),

        asset
    ];

    // -------------------------------------------------
    // STEP 5: SAVE CREATE TRANSACTION
    // -------------------------------------------------

    await saveTransactionToDatabase({

        id:
            `tx-create-${assetId}`,

        operation:
            "CREATE_ASSET",

        assetId,

        initiatedBy:
            createdBy,

        toUser:
            owner.id,

        status:
            "CONFIRMED",

        blockchainTxId:
            assetTx.blockchainTxId ||
            assetTx.transactionId ||
            null
    });

    // -------------------------------------------------
    // STEP 6: SAVE MINT TRANSACTION
    // -------------------------------------------------

    await saveTransactionToDatabase({

        id:
            `tx-mint-${nftId}`,

        operation:
            "MINT_NFT",

        assetId,

        initiatedBy:
            createdBy,

        toUser:
            owner.id,

        status:
            "CONFIRMED",

        blockchainTxId:
            nftTx.blockchainTxId ||
            nftTx.transactionId ||
            null
    });

    // -------------------------------------------------
    // IN-MEMORY TRANSACTIONS
    // -------------------------------------------------

    store.transactions = [

        ...(store.transactions || []),

        new Transaction({

            id:
                `tx-create-${assetId}`,

            operation:
                "CREATE_ASSET",

            assetId,

            initiatedBy:
                createdBy,

            toUser:
                owner.id,

            status:
                "CONFIRMED",

            blockchainTxId:
                assetTx.blockchainTxId ||
                assetTx.transactionId ||
                null
        }),

        new Transaction({

            id:
                `tx-mint-${nftId}`,

            operation:
                "MINT_NFT",

            assetId,

            initiatedBy:
                createdBy,

            toUser:
                owner.id,

            status:
                "CONFIRMED",

            blockchainTxId:
                nftTx.blockchainTxId ||
                nftTx.transactionId ||
                null
        })
    ];

    return asset;
};

// ---------------------------------------------------------
// TRANSFER ASSET
// ---------------------------------------------------------

const transferAsset = async (
    id,
    {
        toUserDid,
        initiatedBy,
        reason = ""
    } = {}
) => {
    if (!id) {

        throw new Error(
            "Asset ID is required"
        );
    }

    if (!toUserDid) {

        throw new Error(
            "Recipient DID is required"
        );
    }

    const asset =
        await getAssetById(
            id
        );

    if (!asset) {

        throw new Error(
            "Asset not found or NFT is not minted"
        );
    }
console.log("TRANSFER DEBUG - toUserDid:", JSON.stringify(toUserDid));
    const recipient =
        await getOwnerByDid(
            toUserDid
        );

    if (!recipient) {

        throw new Error(
            "Recipient DID not found"
        );
    }

    const previousOwnerId =
        asset.ownerId;

    // -------------------------------------------------
    // FABRIC TRANSFER
    // -------------------------------------------------

    const transferTx =
        await blockchainService.submitTransaction(
            "TRANSFER_ASSET",
            id,
            toUserDid
        );

    if (
        !transferTx ||
        !transferTx.success
    ) {

        throw new Error(
            "Blockchain transfer failed"
        );
    }

    // -------------------------------------------------
    // UPDATE DATABASE
    // -------------------------------------------------

    await pool.execute(
        `
        UPDATE assets
        SET owner_id = ?
        WHERE id = ?
        `,
        [
            recipient.id,
            id
        ]
    );

    asset.ownerId =
        recipient.id;

    asset.ownerDid =
        recipient.did ||
        toUserDid;

    asset.ownerName =
        recipient.name;

    asset.ownerEmail =
        recipient.email;

    // -------------------------------------------------
    // TRANSACTION
    // -------------------------------------------------

    const transactionId =
        `tx-transfer-${Date.now()}`;

    await saveTransactionToDatabase({

        id:
            transactionId,

        operation:
            "TRANSFER_ASSET",

        assetId:
            id,

        initiatedBy,

        fromUser:
            previousOwnerId,

        toUser:
            recipient.id,

        status:
            "CONFIRMED",

        blockchainTxId:
            transferTx.blockchainTxId ||
            transferTx.transactionId ||
            null
    });

    store.transactions = [

        ...(store.transactions || []),

        new Transaction({

            id:
                transactionId,

            operation:
                "TRANSFER_ASSET",

            assetId:
                id,

            initiatedBy,

            fromUser:
                previousOwnerId,

            toUser:
                recipient.id,

            status:
                "CONFIRMED",

            blockchainTxId:
                transferTx.blockchainTxId ||
                transferTx.transactionId ||
                null
        })
    ];

    store.assets =
        (store.assets || [])
            .map(
                (item) =>
                    String(
                        item.id
                    ) ===
                    String(
                        id
                    )
                        ? asset
                        : item
            );

    return asset;
};

// ---------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------

module.exports = {

    getAllAssets,

    getAssetById,

    getOwnerByDid,

    getOwnerByIdOrDid,

    createAsset,

    transferAsset
};