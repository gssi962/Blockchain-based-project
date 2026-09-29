const express = require("express");

const {
    register,
    login,

    verifyEmailOTP,
    resendEmailOTP,

    // Forgot Password
    forgotPassword,
    verifyResetOTP,
    resetPassword,

    enrollDIDPublicKey,
    generateChallenge,
    verifyDIDSignature,
    me

} = require("../controllers/authController");

const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// PUBLIC AUTH
// =====================================================

router.post(
    "/register",
    register
);

router.post(
    "/login",
    login
);


// =====================================================
// EMAIL OTP
// =====================================================

router.post(
    "/verify-email-otp",
    verifyEmailOTP
);

router.post(
    "/resend-email-otp",
    resendEmailOTP
);


// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/verify-reset-otp",
    verifyResetOTP
);

router.post(
    "/reset-password",
    resetPassword
);


// =====================================================
// CURRENT USER
// =====================================================

router.get(
    "/me",
    authMiddleware,
    me
);


// =====================================================
// DID
// =====================================================

router.post(
    "/did/enroll",
    authMiddleware,
    enrollDIDPublicKey
);

router.get(
    "/did/challenge",
    authMiddleware,
    generateChallenge
);

router.post(
    "/did/verify",
    authMiddleware,
    verifyDIDSignature
);


module.exports = router;