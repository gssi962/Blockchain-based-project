const fs = require("fs");
const path = require("path");

const assetService =
    require("../services/assetService");

const {
    sendSuccess,
    sendError
} = require("../utils/response");

// =====================================================
// GET ALL ASSETS
// =====================================================

const getAssets = async (req, res) => {

    try {

        const assets =
            await assetService.getAllAssets({
                userId:
                    req.user.id,

                role:
                    req.user.role_id
            });

        return sendSuccess(
            res,
            assets
        );

    } catch (error) {

        console.error(
            "Get assets error:",
            error
        );

        return sendError(
            res,
            error.message
        );
    }
};

// =====================================================
// GET SINGLE ASSET
// =====================================================

const getAsset = async (req, res) => {

    try {

        const asset =
            await assetService.getAssetById(
                req.params.id
            );

        if (!asset) {

            return sendError(
                res,
                "Asset not found",
                404
            );
        }

        return sendSuccess(
            res,
            asset
        );

    } catch (error) {

        console.error(
            "Get asset error:",
            error
        );

        return sendError(
            res,
            error.message
        );
    }
};

// =====================================================
// CREATE ASSET
// =====================================================
//
// Actual document is received through:
//
// req.file
//
// NOT req.body.file
//
// Multer has already saved the physical file into:
//
// backend/uploads/assets/
//
// The service calculates SHA-256 and stores the
// metadata/hash/reference.
// =====================================================

const createAsset = async (req, res) => {

    let uploadedFilePath = null;

    try {

        const {
            name,
            description,
            category,
            ownerDid,
            value
        } = req.body;

        // -------------------------------------------------
        // ACTUAL UPLOADED FILE
        // -------------------------------------------------

        const uploadedFile =
            req.file || null;

        if (!name) {

            if (uploadedFile) {
                uploadedFilePath =
                    uploadedFile.path;
            }

            return sendError(
                res,
                "Asset name is required",
                400
            );
        }

        if (!ownerDid) {

            if (uploadedFile) {
                uploadedFilePath =
                    uploadedFile.path;
            }

            return sendError(
                res,
                "Owner DID is required",
                400
            );
        }

        // -------------------------------------------------
        // DOCUMENT IS REQUIRED
        // -------------------------------------------------

        if (!uploadedFile) {

            return sendError(
                res,
                "Document is required",
                400
            );
        }

        uploadedFilePath =
            uploadedFile.path;

        // -------------------------------------------------
        // CREATE ASSET
        // -------------------------------------------------

        const asset =
            await assetService.createAsset({

                name,

                description,

                category,

                ownerDid,

                value,

                filePath:
                    uploadedFile.path,

                fileName:
                    uploadedFile.originalname,

                fileType:
                    uploadedFile.mimetype,

                fileSize:
                    uploadedFile.size,

                storageFileName:
                    uploadedFile.filename,

                createdBy:
                    req.user.id
            });

        // -------------------------------------------------
        // FILE SUCCESSFULLY LINKED
        // -------------------------------------------------

        uploadedFilePath =
            null;

        return sendSuccess(
            res,
            asset,
            201
        );

    } catch (error) {

        console.error(
            "Create asset error:",
            error
        );

        // -------------------------------------------------
        // CLEANUP UPLOADED FILE
        // -------------------------------------------------
        //
        // If blockchain/database creation fails,
        // don't leave an unused private document.
        // -------------------------------------------------

        if (
            uploadedFilePath &&
            fs.existsSync(
                uploadedFilePath
            )
        ) {

            try {

                fs.unlinkSync(
                    uploadedFilePath
                );

                console.log(
                    "Unused uploaded file removed:",
                    path.basename(
                        uploadedFilePath
                    )
                );

            } catch (cleanupError) {

                console.error(
                    "Uploaded file cleanup failed:",
                    cleanupError.message
                );
            }
        }

        return sendError(
            res,
            error.message
        );
    }
};

// =====================================================
// GET PRIVATE ASSET DOCUMENT
// =====================================================
//
// The uploads folder is NEVER publicly exposed.
//
// Document is returned only after:
//
// authMiddleware
// +
// VIEW_ASSET permission
//
// =====================================================

const getAssetDocument = async (
    req,
    res
) => {

    try {

        const asset =
            await assetService.getAssetById(
                req.params.id
            );

        if (!asset) {

            return sendError(
                res,
                "Asset not found",
                404
            );
        }

        if (
            !asset.storageReference &&
            !asset.storageFileName
        ) {

            return sendError(
                res,
                "No document is attached to this asset",
                404
            );
        }

        const storageFileName =
            asset.storageFileName ||
            path.basename(
                asset.storageReference ||
                ""
            );

        if (!storageFileName) {

            return sendError(
                res,
                "Document reference is missing",
                404
            );
        }

        // -------------------------------------------------
        // SECURITY:
        // Only basename is allowed.
        // This prevents ../ path traversal.
        // -------------------------------------------------

        const safeFileName =
            path.basename(
                storageFileName
            );

        const uploadDirectory =
            path.join(
                __dirname,
                "../../uploads/assets"
            );

        const filePath =
            path.join(
                uploadDirectory,
                safeFileName
            );

        if (
            !fs.existsSync(
                filePath
            )
        ) {

            return sendError(
                res,
                "Stored document was not found",
                404
            );
        }

        // -------------------------------------------------
        // ORIGINAL FILENAME
        // -------------------------------------------------

        const originalName =
            asset.fileName ||
            safeFileName;

        // -------------------------------------------------
        // CONTENT TYPE
        // -------------------------------------------------

        if (asset.fileType) {

            res.setHeader(
                "Content-Type",
                asset.fileType
            );
        }

        res.setHeader(
            "Content-Disposition",
            `inline; filename="${String(
                originalName
            ).replace(/"/g, "")}"`
        );

        // -------------------------------------------------
        // SEND PRIVATE FILE
        // -------------------------------------------------

        return res.sendFile(
            path.resolve(
                filePath
            )
        );

    } catch (error) {

        console.error(
            "Get asset document error:",
            error
        );

        return sendError(
            res,
            error.message
        );
    }
};

// =====================================================
// TRANSFER ASSET
// =====================================================

// =====================================================
// TRANSFER ASSET
// =====================================================

const transferAsset = async (req, res) => {
    try {

        const {
            toUser,
            newOwner,
            reason
        } = req.body;

        // Frontend currently sends newOwner.
        // Backend also supports toUser for compatibility.
        const recipientDid =
            toUser ||
            newOwner;

        if (!recipientDid) {
            return sendError(
                res,
                "Recipient user is required",
                400
            );
        }

        const result =
            await assetService.transferAsset(
                req.params.id,
                {
                    toUserDid: recipientDid,
                    initiatedBy: req.user.id,
                    reason: reason || ""
                }
            );

        return sendSuccess(
            res,
            result
        );

    } catch (error) {

        console.error(
            "Transfer asset error:",
            error
        );

        return sendError(
            res,
            error.message
        );
    }
};

// =====================================================
// ASSET STATS
// =====================================================

const getAssetStats = async (
    req,
    res
) => {

    try {

        const assets =
            await assetService.getAllAssets();

        const stats = {

            totalAssets:
                assets.length,

            activeAssets:
                assets.filter(
                    (asset) =>
                        asset.status ===
                        "ACTIVE"
                ).length,

            nftLinked:
                assets.filter(
                    (asset) =>
                        asset.nftId
                ).length
        };

        return sendSuccess(
            res,
            stats
        );

    } catch (error) {

        console.error(
            "Asset stats error:",
            error
        );

        return sendError(
            res,
            error.message
        );
    }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getAssets,

    getAsset,

    createAsset,

    getAssetDocument,

    transferAsset,

    getAssetStats
};