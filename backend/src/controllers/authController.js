const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const { pool } = require("../config/database");

const {
    generateDID,
    verifySignature
} = require("../services/didService");

// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// =====================================================
// OTP CONFIG
// =====================================================

const OTP_EXPIRY_MS =
    Number(process.env.OTP_EXPIRY_MINUTES || 5) *
    60 *
    1000;

const generateOTP = () => {
    return crypto
        .randomInt(100000, 1000000)
        .toString();
};

// =====================================================
// SEND EMAIL OTP
// =====================================================

const sendOTPEmail = async (
    email,
    otp,
    type = "verification"
) => {

    const isPasswordReset =
        type === "password-reset";

    const subject = isPasswordReset
        ? "CRYPTA SHIELD - Password Reset OTP"
        : "CRYPTA SHIELD - Email Verification OTP";

    const introText = isPasswordReset
        ? "Your CRYPTA SHIELD password reset OTP is:"
        : "Your CRYPTA SHIELD email verification OTP is:";

    const introHtml = isPasswordReset
        ? "Your CRYPTA SHIELD password reset OTP is:"
        : "Your CRYPTA SHIELD email verification OTP is:";

    await emailTransporter.sendMail({
        from: `"CRYPTA SHIELD" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,

        text: `
${introText}

${otp}

This OTP is valid for ${
            process.env.OTP_EXPIRY_MINUTES || 5
        } minutes.

If you did not request this, please ignore this email.
        `,

        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2>CRYPTA SHIELD</h2>

                <p>${introHtml}</p>

                <h1 style="letter-spacing: 8px;">
                    ${otp}
                </h1>

                <p>
                    This OTP is valid for
                    <strong>${
                        process.env.OTP_EXPIRY_MINUTES || 5
                    } minutes</strong>.
                </p>

                <p>
                    If you did not request this,
                    please ignore this email.
                </p>
            </div>
        `
    });
};

// =====================================================
// DID CHALLENGE STORAGE
// =====================================================

const didChallenges = new Map();

const CHALLENGE_EXPIRY_MS =
    2 * 60 * 1000;

// =====================================================
// PASSWORD RESET TOKEN STORAGE
// =====================================================

const passwordResetTokens = new Map();

const PASSWORD_RESET_TOKEN_EXPIRY_MS =
    10 * 60 * 1000;

// =====================================================
// REGISTER
// =====================================================

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            publicKey
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required"
            });
        }

        if (!publicKey) {
            return res.status(400).json({
                success: false,
                message:
                    "Public key is required"
            });
        }

        const trimmedName = name.trim();

        const trimmedEmail =
            email.trim().toLowerCase();

        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message:
                    "Name is required"
            });
        }

        // =================================================
        // PASSWORD VALIDATION
        // =================================================

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters"
            });
        }

        // =================================================
        // GMAIL VALIDATION
        // =================================================

        const gmailRegex =
            /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (!gmailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please use a valid Gmail address"
            });
        }

        // =================================================
        // VALIDATE ED25519 PUBLIC KEY
        // =================================================

        try {
            const keyObject =
                crypto.createPublicKey(publicKey);

            if (
                keyObject.asymmetricKeyType !==
                "ed25519"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid Ed25519 public key"
                });
            }

        } catch (error) {

            console.error(
                "Public key validation error:",
                error.message
            );

            return res.status(400).json({
                success: false,
                message:
                    "Invalid public key format"
            });
        }

        // =================================================
        // CHECK EXISTING USER
        // =================================================

        const [existingUsers] =
            await pool.execute(
                `
                SELECT
                    id,
                    email_verified
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [trimmedEmail]
            );

        if (existingUsers.length > 0) {

            const existingUser =
                existingUsers[0];

            if (
                Number(
                    existingUser.email_verified
                ) === 0
            ) {
                return res.status(409).json({
                    success: false,
                    message:
                        "This email is already registered but not verified. Please verify your existing OTP."
                });
            }

            return res.status(409).json({
                success: false,
                message:
                    "Email is already registered"
            });
        }

        // =================================================
        // CREATE USER
        // =================================================

        const userId =
            `user-${crypto.randomUUID()}`;

        const did =
            generateDID(userId);

        // Admin assigns role later
        const roleId = null;

        const organization = null;

        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );

        // =================================================
        // GENERATE EMAIL OTP
        // =================================================

        const otp =
            generateOTP();

        const otpExpiresAt =
            new Date(
                Date.now() +
                OTP_EXPIRY_MS
            );

        // =================================================
        // INSERT USER
        // =================================================

        await pool.execute(
            `
            INSERT INTO users
            (
                id,
                name,
                email,
                password_hash,
                role_id,
                did,
                public_key,
                organization,
                verified,
                status,
                email_verified,
                email_otp,
                email_otp_expires
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                trimmedName,
                trimmedEmail,
                passwordHash,
                roleId,
                did,
                publicKey,
                organization,
                0,
                "ACTIVE",
                0,
                otp,
                otpExpiresAt
            ]
        );

        // =================================================
        // SEND OTP
        // =================================================

        try {

            await sendOTPEmail(
                trimmedEmail,
                otp,
                "verification"
            );

        } catch (emailError) {

            console.error(
                "OTP email sending failed:",
                emailError.message
            );

            await pool.execute(
                `
                DELETE FROM users
                WHERE id = ?
                `,
                [userId]
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to send verification email. Please try again."
            });
        }

        // =================================================
        // SUCCESS
        // =================================================

        return res.status(201).json({
            success: true,

            message:
                "Registration created. OTP has been sent to your Gmail.",

            requiresEmailVerification: true,

            user: {
                id: userId,
                name: trimmedName,
                email: trimmedEmail,
                role: "PENDING",
                roleId: null,
                did,
                organization,
                verified: 0,
                emailVerified: false,
                status: "ACTIVE"
            }
        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Registration failed"
        });
    }
};

// =====================================================
// VERIFY EMAIL OTP
// =====================================================

const verifyEmailOTP = async (
    req,
    res
) => {

    try {

        const {
            email,
            otp
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required"
            });
        }

        const trimmedEmail =
            email.trim().toLowerCase();

        const cleanOTP =
            String(otp).trim();

        const [rows] =
            await pool.execute(
                `
                SELECT
                    id,
                    name,
                    email,
                    did,
                    role_id,
                    organization,
                    verified,
                    status,
                    email_verified,
                    email_otp,
                    email_otp_expires
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [trimmedEmail]
            );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Registration not found"
            });
        }

        const user = rows[0];

        if (
            Number(user.email_verified) === 1
        ) {

            return res.status(200).json({
                success: true,
                message:
                    "Email is already verified",
                emailVerified: true
            });
        }

        if (!user.email_otp) {
            return res.status(400).json({
                success: false,
                message:
                    "No active OTP found"
            });
        }

        if (
            !user.email_otp_expires ||
            new Date(
                user.email_otp_expires
            ).getTime() < Date.now()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired. Please request a new OTP."
            });
        }

        if (
            cleanOTP !==
            String(user.email_otp)
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid OTP"
            });
        }

        await pool.execute(
            `
            UPDATE users
            SET
                email_verified = 1,
                email_otp = NULL,
                email_otp_expires = NULL
            WHERE id = ?
            `,
            [user.id]
        );

        return res.status(200).json({
            success: true,
            message:
                "Email verified successfully",
            emailVerified: true,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role_id
                    ? user.role_id
                    : "PENDING",
                roleId: user.role_id,
                did: user.did,
                organization:
                    user.organization,
                verified:
                    user.verified,
                emailVerified: true,
                status: user.status
            }
        });

    } catch (error) {

        console.error(
            "Email OTP verification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Email verification failed"
        });
    }
};

// =====================================================
// RESEND EMAIL OTP
// =====================================================

const resendEmailOTP = async (
    req,
    res
) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Email is required"
            });
        }

        const trimmedEmail =
            email.trim().toLowerCase();

        const [rows] =
            await pool.execute(
                `
                SELECT
                    id,
                    email_verified
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [trimmedEmail]
            );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Registration not found"
            });
        }

        const user = rows[0];

        if (
            Number(user.email_verified) === 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email is already verified"
            });
        }

        const otp =
            generateOTP();

        const otpExpiresAt =
            new Date(
                Date.now() +
                OTP_EXPIRY_MS
            );

        await pool.execute(
            `
            UPDATE users
            SET
                email_otp = ?,
                email_otp_expires = ?
            WHERE id = ?
            `,
            [
                otp,
                otpExpiresAt,
                user.id
            ]
        );

        try {

            await sendOTPEmail(
                trimmedEmail,
                otp,
                "verification"
            );

        } catch (emailError) {

            console.error(
                "Resend OTP email failed:",
                emailError.message
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to send OTP"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "A new OTP has been sent to your Gmail."
        });

    } catch (error) {

        console.error(
            "Resend OTP error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to resend OTP"
        });
    }
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

const forgotPassword = async (
    req,
    res
) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Email is required"
            });
        }

        const trimmedEmail =
            email.trim().toLowerCase();

        // =================================================
        // FIND USER
        // =================================================

        const [rows] =
            await pool.execute(
                `
                SELECT
                    id,
                    email,
                    status,
                    email_verified
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [trimmedEmail]
            );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "No account found with this email"
            });
        }

        const user = rows[0];

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message:
                    "Account is not active"
            });
        }

        // =================================================
        // GENERATE RESET OTP
        // =================================================

        const otp =
            generateOTP();

        const otpExpiresAt =
            new Date(
                Date.now() +
                OTP_EXPIRY_MS
            );

        // =================================================
        // REUSE OTP COLUMNS
        // =================================================

        await pool.execute(
            `
            UPDATE users
            SET
                email_otp = ?,
                email_otp_expires = ?
            WHERE id = ?
            `,
            [
                otp,
                otpExpiresAt,
                user.id
            ]
        );

        // =================================================
        // SEND PASSWORD RESET OTP
        // =================================================

        try {

            await sendOTPEmail(
                trimmedEmail,
                otp,
                "password-reset"
            );

        } catch (emailError) {

            console.error(
                "Password reset OTP sending failed:",
                emailError.message
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to send password reset OTP. Please try again."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Password reset OTP has been sent to your Gmail.",
            requiresOTP: true
        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to process forgot password request"
        });
    }
};

// =====================================================
// VERIFY PASSWORD RESET OTP
// =====================================================

const verifyResetOTP = async (
    req,
    res
) => {

    try {

        const {
            email,
            otp
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required"
            });
        }

        const trimmedEmail =
            email.trim().toLowerCase();

        const cleanOTP =
            String(otp).trim();

        const [rows] =
            await pool.execute(
                `
                SELECT
                    id,
                    email,
                    status,
                    email_otp,
                    email_otp_expires
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [trimmedEmail]
            );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Account not found"
            });
        }

        const user = rows[0];

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message:
                    "Account is not active"
            });
        }

        if (!user.email_otp) {
            return res.status(400).json({
                success: false,
                message:
                    "No active password reset OTP found"
            });
        }

        if (
            !user.email_otp_expires ||
            new Date(
                user.email_otp_expires
            ).getTime() < Date.now()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired. Please request a new OTP."
            });
        }

        if (
            cleanOTP !==
            String(user.email_otp)
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid OTP"
            });
        }

        // =================================================
        // CREATE TEMPORARY RESET TOKEN
        // =================================================

        const resetToken =
            crypto.randomBytes(32).toString("hex");

        passwordResetTokens.set(
            resetToken,
            {
                userId: user.id,
                email: user.email,
                expiresAt:
                    Date.now() +
                    PASSWORD_RESET_TOKEN_EXPIRY_MS
            }
        );

        // OTP cannot be reused
        await pool.execute(
            `
            UPDATE users
            SET
                email_otp = NULL,
                email_otp_expires = NULL
            WHERE id = ?
            `,
            [user.id]
        );

        return res.status(200).json({
            success: true,
            message:
                "OTP verified successfully. You can now set a new password.",
            resetToken,
            expiresIn:
                PASSWORD_RESET_TOKEN_EXPIRY_MS /
                1000
        });

    } catch (error) {

        console.error(
            "Reset OTP verification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to verify password reset OTP"
        });
    }
};

// =====================================================
// RESET PASSWORD
// =====================================================

const resetPassword = async (
    req,
    res
) => {

    try {

        const {
            email,
            resetToken,
            newPassword
        } = req.body;

        if (
            !email ||
            !resetToken ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email, reset token and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters"
            });
        }

        const trimmedEmail =
            email.trim().toLowerCase();

        // =================================================
        // CHECK RESET TOKEN
        // =================================================

        const resetData =
            passwordResetTokens.get(
                resetToken
            );

        if (!resetData) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid or expired password reset session"
            });
        }

        if (
            Date.now() >
            resetData.expiresAt
        ) {

            passwordResetTokens.delete(
                resetToken
            );

            return res.status(401).json({
                success: false,
                message:
                    "Password reset session has expired. Please request a new OTP."
            });
        }

        if (
            resetData.email !==
            trimmedEmail
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Password reset session does not match this email"
            });
        }

        // =================================================
        // HASH NEW PASSWORD
        // =================================================

        const passwordHash =
            await bcrypt.hash(
                newPassword,
                10
            );

        // =================================================
        // UPDATE PASSWORD
        // =================================================

        const [result] =
            await pool.execute(
                `
                UPDATE users
                SET password_hash = ?
                WHERE id = ?
                `,
                [
                    passwordHash,
                    resetData.userId
                ]
            );

        if (result.affectedRows === 0) {

            passwordResetTokens.delete(
                resetToken
            );

            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        // =================================================
        // INVALIDATE RESET TOKEN
        // =================================================

        passwordResetTokens.delete(
            resetToken
        );

        return res.status(200).json({
            success: true,
            message:
                "Password reset successfully. You can now login with your new password."
        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to reset password"
        });
    }
};

// =====================================================
// LOGIN
// =====================================================

const login = async (
    req,
    res
) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });
        }

        const [rows] =
            await pool.execute(
                `
                SELECT
                    id,
                    name,
                    email,
                    password_hash,
                    role_id,
                    did,
                    public_key,
                    organization,
                    verified,
                    status,
                    email_verified
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [
                    email.trim().toLowerCase()
                ]
            );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        const user = rows[0];

        if (
            user.status !== "ACTIVE"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Account is not active"
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        // =================================================
        // EMAIL VERIFICATION
        // =================================================

        if (
            user.email_verified !== undefined &&
            user.email_verified !== null &&
            Number(user.email_verified) === 0
        ) {

            return res.status(403).json({
                success: false,
                requiresEmailVerification: true,
                message:
                    "Please verify your Gmail using the OTP sent to your email."
            });
        }

        // =================================================
        // ROLE MUST BE ASSIGNED
        // =================================================

        if (!user.role_id) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account is pending admin role assignment"
            });
        }

        // =================================================
        // ROLE MAPPING
        // =================================================

        const roleMap = {
            "role-admin": "ADMIN",
            "role-manager": "MANAGER",
            "role-auditor": "AUDITOR",
            "role-user": "USER"
        };

        const role =
            roleMap[user.role_id];

        if (!role) {
            return res.status(403).json({
                success: false,
                message:
                    "Invalid or unassigned role"
            });
        }

        // =================================================
        // JWT
        // =================================================

        const token =
            jwt.sign(
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

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role,
            roleId: user.role_id,
            did: user.did,
            organization:
                user.organization,
            verified:
                user.verified,
            emailVerified:
                Number(user.email_verified) === 1,
            status:
                user.status,
            hasDIDKey:
                !!user.public_key
        };

        return res.status(200).json({
            success: true,
            message:
                "Login successful",
            token,
            user: safeUser
        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Login failed"
        });
    }
};

// =====================================================
// ENROLL / ROTATE DID PUBLIC KEY
// =====================================================

const enrollDIDPublicKey = async (
    req,
    res
) => {

    try {

        const userId =
            req.user.id;

        const {
            publicKey
        } = req.body;

        if (!publicKey) {
            return res.status(400).json({
                success: false,
                message:
                    "Public key is required"
            });
        }

        try {

            const keyObject =
                crypto.createPublicKey(
                    publicKey
                );

            if (
                keyObject.asymmetricKeyType !==
                "ed25519"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Only Ed25519 public keys are supported"
                });
            }

        } catch (error) {

            console.error(
                "DID enrollment key validation error:",
                error.message
            );

            return res.status(400).json({
                success: false,
                message:
                    "Invalid DID public key format"
            });
        }

        const [rows] =
            await pool.execute(
                `
                SELECT
                    id,
                    did,
                    status
                FROM users
                WHERE id = ?
                LIMIT 1
                `,
                [userId]
            );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        const user = rows[0];

        if (
            user.status !== "ACTIVE"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Account is not active"
            });
        }

        await pool.execute(
            `
            UPDATE users
            SET
                public_key = ?,
                verified = 0
            WHERE id = ?
            `,
            [
                publicKey,
                userId
            ]
        );

        console.log(
            "DID public key enrolled:",
            userId
        );

        return res.status(200).json({
            success: true,
            message:
                "DID public key enrolled successfully",
            did: user.did,
            verified: false
        });

    } catch (error) {

        console.error(
            "DID enrollment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to enroll DID public key"
        });
    }
};

// =====================================================
// GENERATE DID CHALLENGE
// =====================================================

const generateChallenge = async (
    req,
    res
) => {

    try {

        const userId =
            req.user.id;

        const challenge =
            crypto
                .randomBytes(32)
                .toString("hex");

        const expiresAt =
            Date.now() +
            CHALLENGE_EXPIRY_MS;

        didChallenges.set(
            userId,
            {
                challenge,
                expiresAt
            }
        );

        return res.status(200).json({
            success: true,
            challenge,
            expiresIn:
                CHALLENGE_EXPIRY_MS /
                1000
        });

    } catch (error) {

        console.error(
            "Challenge generation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to generate challenge"
        });
    }
};

// =====================================================
// VERIFY DID SIGNATURE
// =====================================================

const verifyDIDSignature = async (
    req,
    res
) => {

    try {

        const userId =
            req.user.id;

        const {
            challenge,
            signature
        } = req.body;

        if (!challenge || !signature) {
            return res.status(400).json({
                success: false,
                message:
                    "Challenge and signature are required"
            });
        }

        const storedChallenge =
            didChallenges.get(userId);

        if (!storedChallenge) {
            return res.status(400).json({
                success: false,
                message:
                    "No active DID challenge found"
            });
        }

        if (
            Date.now() >
            storedChallenge.expiresAt
        ) {

            didChallenges.delete(userId);

            return res.status(400).json({
                success: false,
                message:
                    "DID challenge has expired"
            });
        }

        if (
            challenge !==
            storedChallenge.challenge
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid DID challenge"
            });
        }

        const [rows] =
            await pool.execute(
                `
                SELECT
                    id,
                    did,
                    public_key,
                    verified,
                    status
                FROM users
                WHERE id = ?
                LIMIT 1
                `,
                [userId]
            );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        const user = rows[0];

        if (
            user.status !== "ACTIVE"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Account is not active"
            });
        }

        if (!user.public_key) {
            return res.status(400).json({
                success: false,
                message:
                    "DID public key is not enrolled"
            });
        }

        try {

            const keyObject =
                crypto.createPublicKey(
                    user.public_key
                );

            if (
                keyObject.asymmetricKeyType !==
                "ed25519"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid stored DID public key"
                });
            }

        } catch (keyError) {

            console.error(
                "Stored public key validation failed:",
                keyError.message
            );

            return res.status(400).json({
                success: false,
                message:
                    "Invalid stored DID public key"
            });
        }

        const isValid =
            verifySignature(
                challenge,
                signature,
                user.public_key
            );

        console.log(
            "========== DID VERIFY =========="
        );

        console.log(
            "User ID:",
            user.id
        );

        console.log(
            "DID:",
            user.did
        );

        console.log(
            "Signature received:",
            !!signature
        );

        console.log(
            "DID cryptographic verification:",
            isValid
        );

        console.log(
            "================================"
        );

        if (!isValid) {

            return res.status(401).json({
                success: false,
                message:
                    "Cryptographic verification failed"
            });
        }

        await pool.execute(
            `
            UPDATE users
            SET verified = 1
            WHERE id = ?
            `,
            [user.id]
        );

        didChallenges.delete(userId);

        return res.status(200).json({
            success: true,
            message:
                "DID cryptographically verified",
            did: user.did,
            verified: true
        });

    } catch (error) {

        console.error(
            "DID verification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "DID verification failed"
        });
    }
};

// =====================================================
// CURRENT USER
// =====================================================

const me = (
    req,
    res
) => {

    return res.status(200).json({
        success: true,
        user: req.user
    });
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    register,

    login,

    verifyEmailOTP,

    resendEmailOTP,

    forgotPassword,

    verifyResetOTP,

    resetPassword,

    enrollDIDPublicKey,

    generateChallenge,

    verifyDIDSignature,

    me
};