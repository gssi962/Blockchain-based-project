const express = require("express");

const {
    listRoles,
    createRole,
    updatePermissions
} = require("../controllers/roleController");

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
    rbacMiddleware("VIEW_ROLES"),
    listRoles
);

router.post(
    "/",
    authMiddleware,
    rbacMiddleware("CREATE_ROLE"),
    createRole
);

router.patch(
    "/:id/permissions",
    authMiddleware,
    rbacMiddleware("MANAGE_PERMISSIONS"),
    updatePermissions
);

module.exports = router;