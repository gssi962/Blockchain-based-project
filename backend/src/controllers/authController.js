const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try {
        console.log("Login API HIT");
        console.log("EMAIL Received:", req.body.email); 
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // TEMPORARY LOGIN FOR TESTING
        if (
            email.trim().toLowerCase() === "crypta183@gmail.com" &&
            password === "cryptashield"
        ) {
            const user = {
                id: "user-admin",
                name: "CRYPTA Admin",
                email: "crypta183@gmail.com",
                role: "Admin",
                roleId: "role-admin",
                did: "did:sih:admin-001",
                organization: "CRYPTA",
                verified: true
            };

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    roleId: user.roleId,
                    did: user.did
                },
                process.env.JWT_SECRET || "crypta-secret",
                {
                    expiresIn: "24h"
                }
            );

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                user
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
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