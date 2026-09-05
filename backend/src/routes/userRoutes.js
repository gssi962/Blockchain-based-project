const express = require("express");

const {
    getUsers,
    getUser,
    createUser,
    updateUserRole
} = require("../controllers/userController");

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
    rbacMiddleware("VIEW_USERS"),
    getUsers
);

router.get(
    "/:id",
    authMiddleware,
    rbacMiddleware("VIEW_USERS"),
    getUser
);

router.post(
    "/",
    authMiddleware,
    rbacMiddleware("CREATE_USER"),
    createUser
);

router.patch(
    "/:id/role",
    authMiddleware,
    rbacMiddleware("ASSIGN_ROLE"),
    updateUserRole
);

module.exports = router;