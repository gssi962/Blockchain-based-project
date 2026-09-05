const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const [rows] = await pool.execute(
            `
            SELECT 
                id,
                name,
                email,
                password_hash,
                role_id,
                did,
                organization,
                verified,
                status
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [email.trim()]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = rows[0];

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Account is not active"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                roleId: user.role_id,
                did: user.did
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        const roleMap = {
            "role-admin": "ADMIN",
            "role-manager": "MANAGER",
            "role-auditor": "AUDITOR",
            "role-user": "USER"
        };

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: roleMap[user.role_id] || "USER",
            roleId: user.role_id,
            did: user.did,
            organization: user.organization,
            verified: user.verified,
            status: user.status
        };

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: safeUser
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};

const me = (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user
    });
};

module.exports = {
    login,
    me
};