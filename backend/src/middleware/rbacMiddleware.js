const { pool } = require("../config/database");

const rbacMiddleware = (...requiredPermissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            const [rows] = await pool.execute(
                `
                SELECT p.name
                FROM role_permissions rp
                JOIN permissions p
                    ON p.id = rp.permission_id
                WHERE rp.role_id = ?
                `,
                [req.user.role_id]
            );

            const permissions = rows.map(
                (row) => row.name
            );

            const allowed = requiredPermissions.every(
                (permission) =>
                    permissions.includes(permission)
            );

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You do not have permission for this action"
                });
            }

            req.permissions = permissions;

            next();

        } catch (error) {
            console.error(
                "RBAC error:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Permission check failed"
            });
        }
    };
};

module.exports = {
    rbacMiddleware
};