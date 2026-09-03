const express = require("express");

const controller =
    require("../controllers/auditController");

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
    rbacMiddleware("VIEW_AUDIT"),
    controller.list
);

router.get(
    "/stats",
    authMiddleware,
    rbacMiddleware("VIEW_AUDIT"),
    controller.stats
);

router.get(
    "/:id",
    authMiddleware,
    rbacMiddleware("VIEW_AUDIT"),
    controller.get
);

module.exports = router;