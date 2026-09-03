const express = require("express");

const {
    list,
    get
} = require("../controllers/transactionController");

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
    rbacMiddleware("VIEW_TRANSACTION"),
    list
);

router.get(
    "/:id",
    authMiddleware,
    rbacMiddleware("VIEW_TRANSACTION"),
    get
);

module.exports = router;