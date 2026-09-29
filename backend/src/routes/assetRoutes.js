const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
    getAssets,
    getAsset,
    createAsset,
    transferAsset,
    getAssetStats,
    getAssetDocument
} = require("../controllers/assetController");

const {
    authMiddleware
} = require("../middleware/authMiddleware");

const {
    rbacMiddleware
} = require("../middleware/rbacMiddleware");

const router = express.Router();

// =====================================================
// PRIVATE ASSET UPLOAD DIRECTORY
// =====================================================
//
// IMPORTANT:
// This directory is NOT exposed using express.static().
// Therefore normal users cannot directly browse the
// server folder.
//
// Files are accessed only through the authenticated
// document API below.
// =====================================================

const uploadDirectory = path.join(
    __dirname,
    "../../uploads/assets"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );
}

// =====================================================
// MULTER STORAGE
// =====================================================
//
// A random server filename is used instead of the
// original filename to avoid filename collisions
// and path traversal issues.
//
// Original filename is stored separately in MySQL.
// =====================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            uploadDirectory
        );
    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        const uniqueName =
            `asset-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 12)}${extension}`;

        cb(
            null,
            uniqueName
        );
    }
});

// =====================================================
// ALLOWED FILE TYPES
// =====================================================

const allowedMimeTypes = new Set([
    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "image/jpeg",

    "image/png",

    "image/webp",

    "text/plain",

    "video/mp4",

    "video/webm"
]);

// =====================================================
// MULTER UPLOAD CONFIGURATION
// =====================================================

const upload = multer({

    storage,

    limits: {
        fileSize:
            50 * 1024 * 1024
    },

    fileFilter: (
        req,
        file,
        cb
    ) => {

        if (
            allowedMimeTypes.has(
                file.mimetype
            )
        ) {

            cb(
                null,
                true
            );

        } else {

            cb(
                new Error(
                    "Unsupported file type. Allowed: PDF, DOC, DOCX, JPG, PNG, WEBP, TXT, MP4 and WEBM."
                )
            );
        }
    }
});

// =====================================================
// GET ALL ASSETS
// =====================================================

router.get(
    "/",
    authMiddleware,
    rbacMiddleware("VIEW_ASSET"),
    getAssets
);

// =====================================================
// ASSET STATS
// =====================================================

router.get(
    "/stats",
    authMiddleware,
    rbacMiddleware("VIEW_ASSET"),
    getAssetStats
);

// =====================================================
// GET SINGLE ASSET
// =====================================================

router.get(
    "/:id",
    authMiddleware,
    rbacMiddleware("VIEW_ASSET"),
    getAsset
);

// =====================================================
// CREATE ASSET + ACTUAL DOCUMENT UPLOAD
// =====================================================

router.post(
    "/",
    authMiddleware,
    rbacMiddleware("CREATE_ASSET"),
    upload.single("file"),
    createAsset
);

// =====================================================
// VIEW / DOWNLOAD PRIVATE DOCUMENT
// =====================================================

router.get(
    "/:id/document",
    authMiddleware,
    rbacMiddleware("VIEW_ASSET"),
    getAssetDocument
);

// =====================================================
// TRANSFER ASSET
// =====================================================

router.post(
    "/:id/transfer",
    authMiddleware,
    rbacMiddleware("TRANSFER_ASSET"),
    transferAsset
);

// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
    (error, req, res, next) => {

        if (
            error instanceof multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "File size cannot exceed 50 MB"
                });
            }

            return res.status(400).json({
                success: false,
                message:
                    error.message
            });
        }

        if (
            error &&
            error.message &&
            error.message.startsWith(
                "Unsupported file type"
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    error.message
            });
        }

        return next(error);
    }
);

module.exports = router;