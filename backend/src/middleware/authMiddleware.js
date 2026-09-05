const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");
const { failure } = require("../utils");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return failure(
            res,
            "Authorization token required",
            401
        );
    }

    const parts = authHeader.split(" ");

    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {
        return failure(
            res,
            "Invalid authorization format",
            401
        );
    }

    try {
        const token = parts[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const [rows] = await pool.execute(
            `
            SELECT
                id,
                name,
                email,
                role_id,
                did,
                organization,
                verified,
                status,
                created_at
            FROM users
            WHERE id = ?
            LIMIT 1
            `,
            [decoded.id]
        );

        if (rows.length === 0) {
            return failure(
                res,
                "User not found",
                401
            );
        }

        const user = rows[0];

        if (user.status !== "ACTIVE") {
            return failure(
                res,
                "Account is not active",
                403
            );
        }

        req.user = user;
        req.auth = decoded;

        next();

    } catch (error) {
        console.error(
            "JWT verification error:",
            error.message
        );

        return failure(
            res,
            "Invalid or expired token",
            401
        );
    }
};

module.exports = {
    authMiddleware
};