const jwt = require("jsonwebtoken");

const {
    store
} = require("../config/database");

const {
    failure
} = require("../utils");

const authMiddleware = (
    req,
    res,
    next
) => {

    const authHeader =
        req.headers.authorization;

    if (!authHeader) {
        return failure(
            res,
            "Authorization token required",
            401
        );
    }

    const parts =
        authHeader.split(" ");

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

    const token = parts[1];

    try {

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        const user =
            store.users.find(
                item => item.id === decoded.id
            );

        if (!user) {
            return failure(
                res,
                "User not found",
                401
            );
        }

        req.user = user;
        req.auth = decoded;

        next();

    } catch (error) {

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