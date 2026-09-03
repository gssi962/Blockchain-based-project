const express = require("express");

const {
    getAssets,
    getAsset,
    createAsset,
    transferAsset,
    getAssetStats
} = require("../controllers/assetController");

const {
    authMiddleware
} = require("../middleware/authMiddleware");

const {
    rbacMiddleware
} = require("../middleware/rbacMiddleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    rbacMiddleware("VIEW_ASSET"),
    getAssets
);

router.get(
    "/stats",
    authMiddleware,
    rbacMiddleware("VIEW_ASSET"),
    getAssetStats
);

router.get(
    "/:id",
    authMiddleware,
    rbacMiddleware("VIEW_ASSET"),
    getAsset
);

router.post(
    "/",
    authMiddleware,
    rbacMiddleware("CREATE_ASSET"),
    createAsset
);

router.patch(
    "/:id/transfer",
    authMiddleware,
    rbacMiddleware("TRANSFER_ASSET"),
    transferAsset
);

module.exports = router;