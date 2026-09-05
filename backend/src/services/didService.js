const crypto = require("crypto");

const generateDID = (userId) => {
    return `did:sih:${userId}`;
};

const verifyDID = (did) => {

    if (!did) {
        return false;
    }

    return did.startsWith("did:sih:");
};

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
        issuedAt: new Date().toISOString(),
        status: "VALID"
    };
};

module.exports = {
    generateDID,
    verifyDID,
    generateCredential
};