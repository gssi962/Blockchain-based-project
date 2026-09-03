const { getRole } = require("../services/userService");

const rbacMiddleware = (...requiredPermissions) => {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const role = getRole(req.user.roleId);

        if (!role) {
            return res.status(403).json({
                success: false,
                message: "Role not assigned"
            });
        }

        const allowed = requiredPermissions.every(
            permission =>
                role.permissions.includes(permission)
        );

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission for this action"
            });
        }

        req.role = role;

        next();
    };
};

module.exports = {
    rbacMiddleware
};