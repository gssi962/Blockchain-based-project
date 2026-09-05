const express = require("express");

const controller =
    require("../controllers/dashboardController");

const {
    authMiddleware
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    controller.getDashboard
);

router.get(
    "/stats",
    authMiddleware,
    controller.getStats
);

router.get(
    "/blockchain-status",
    authMiddleware,
    controller.blockchainStatus
);

module.exports = router;