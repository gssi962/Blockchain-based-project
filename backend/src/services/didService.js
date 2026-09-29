const crypto = require("crypto");

// =====================================================
// ED25519 SPKI PREFIX
// =====================================================
// DER prefix for an Ed25519 public key in SPKI format.
// 32-byte raw public key + this prefix = valid SPKI key.

const ED25519_SPKI_PREFIX = Buffer.from(
    "302a300506032b6570032100",
    "hex"
);

// =====================================================
// GENERATE DID
// =====================================================

const generateDID = (userId) => {
    return `did:sih:${userId}`;
};

// =====================================================
// GENERATE CRYPTOGRAPHIC KEY PAIR
// =====================================================

const generateKeyPair = () => {
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair(
            "ed25519",
            {
                publicKeyEncoding: {
                    type: "spki",
                    format: "pem"
                },

                privateKeyEncoding: {
                    type: "pkcs8",
                    format: "pem"
                }
            },

            (error, publicKey, privateKey) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    publicKey,
                    privateKey
                });
            }
        );
    });
};

// =====================================================
// SIGN CHALLENGE
// =====================================================

const signChallenge = (challenge, privateKey) => {
    if (!challenge) {
        throw new Error("Challenge is required");
    }

    if (!privateKey) {
        throw new Error("Private key is required");
    }

    const data = Buffer.from(
        challenge,
        "utf8"
    );

    return crypto
        .sign(null, data, privateKey)
        .toString("base64");
};

// =====================================================
// NORMALIZE PUBLIC KEY
// =====================================================
// Supports:
// 1. Proper SPKI PEM
// 2. Raw 32-byte Ed25519 key accidentally stored
//    inside PEM headers by the earlier implementation.
//
// This lets existing registered users continue working.

const normalizeEd25519PublicKey = (publicKey) => {
    if (!publicKey) {
        throw new Error("Public key is required");
    }

    // -------------------------------------------------
    // Try normal SPKI key first
    // -------------------------------------------------

    try {
        const keyObject = crypto.createPublicKey({
            key: publicKey,
            format: "pem",
            type: "spki"
        });

        if (
            keyObject.asymmetricKeyType ===
            "ed25519"
        ) {
            return keyObject;
        }
    } catch (error) {
        // Continue and check legacy raw key format.
    }

    // -------------------------------------------------
    // Extract Base64 from PEM
    // -------------------------------------------------

    const base64 = publicKey
        .replace(
            /-----BEGIN PUBLIC KEY-----/g,
            ""
        )
        .replace(
            /-----END PUBLIC KEY-----/g,
            ""
        )
        .replace(/\s+/g, "");

    let rawKey;

    try {
        rawKey = Buffer.from(
            base64,
            "base64"
        );
    } catch (error) {
        throw new Error(
            "Invalid public key encoding"
        );
    }

    // -------------------------------------------------
    // Legacy frontend stored exactly 32 raw bytes
    // -------------------------------------------------

    if (rawKey.length === 32) {
        const spkiDer = Buffer.concat([
            ED25519_SPKI_PREFIX,
            rawKey
        ]);

        const keyObject =
            crypto.createPublicKey({
                key: spkiDer,
                format: "der",
                type: "spki"
            });

        if (
            keyObject.asymmetricKeyType !==
            "ed25519"
        ) {
            throw new Error(
                "Public key is not Ed25519"
            );
        }

        return keyObject;
    }

    throw new Error(
        "Invalid Ed25519 public key"
    );
};

// =====================================================
// VERIFY SIGNATURE
// =====================================================

const verifySignature = (
    challenge,
    signature,
    publicKey
) => {
    try {
        if (!challenge) {
            console.error(
                "DID verification: challenge missing"
            );

            return false;
        }

        if (!signature) {
            console.error(
                "DID verification: signature missing"
            );

            return false;
        }

        if (!publicKey) {
            console.error(
                "DID verification: public key missing"
            );

            return false;
        }

        // -------------------------------------------------
        // Normalize public key
        // -------------------------------------------------

        let publicKeyObject;

        try {
            publicKeyObject =
                normalizeEd25519PublicKey(
                    publicKey
                );
        } catch (error) {
            console.error(
                "DID public key parsing failed:",
                error.message
            );

            return false;
        }

        // -------------------------------------------------
        // Decode Base64 signature
        // -------------------------------------------------

        const signatureBuffer =
            Buffer.from(
                signature,
                "base64"
            );

        // Ed25519 signature = exactly 64 bytes
        if (
            signatureBuffer.length !== 64
        ) {
            console.error(
                "Invalid Ed25519 signature length:",
                signatureBuffer.length
            );

            return false;
        }

        // -------------------------------------------------
        // EXACT challenge bytes
        // -------------------------------------------------

        const data = Buffer.from(
            challenge,
            "utf8"
        );

        // -------------------------------------------------
        // Cryptographic verification
        // -------------------------------------------------

        const verified =
            crypto.verify(
                null,
                data,
                publicKeyObject,
                signatureBuffer
            );

        console.log(
            "DID cryptographic verification:",
            verified
        );

        return verified;

    } catch (error) {
        console.error(
            "Signature verification error:",
            error.message
        );

        return false;
    }
};

// =====================================================
// BASIC DID VALIDATION
// =====================================================

const verifyDID = (did) => {
    if (!did) {
        return false;
    }

    return did.startsWith(
        "did:sih:"
    );
};

// =====================================================
// GENERATE CREDENTIAL
// =====================================================

const generateCredential = ({
    userId,
    organization,
    role
}) => {
    return {
        id: crypto.randomUUID(),

        type: "CRYPTAIdentityCredential",

        subject: generateDID(userId),

        organization,

        role,

        issuedAt:
            new Date().toISOString(),

        status: "VALID"
    };
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    generateDID,
    generateKeyPair,
    signChallenge,
    verifySignature,
    verifyDID,
    generateCredential
};