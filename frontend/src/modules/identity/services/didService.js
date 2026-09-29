import * as ed from "@noble/ed25519";

const API_URL = "https://blockchain-based-project.onrender.com/api";

// =====================================================
// HEX HELPERS
// =====================================================

const bytesToHex = (bytes) => {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const hexToBytes = (hex) => {
  if (!hex || hex.length % 2 !== 0) {
    throw new Error("Invalid hexadecimal value");
  }

  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }

  return bytes;
};

// =====================================================
// BYTES → BASE64
// =====================================================

const bytesToBase64 = (bytes) => {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
};

// =====================================================
// BASE64 → BYTES
// =====================================================

const base64ToBytes = (base64) => {
  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

// =====================================================
// ED25519 RAW PUBLIC KEY → SPKI DER
//
// Ed25519 SPKI prefix:
// 30 2a 30 05 06 03 2b 65 70 03 21 00
// =====================================================

const publicKeyToSPKI = (publicKeyBytes) => {
  if (publicKeyBytes.length !== 32) {
    throw new Error(
      "Invalid Ed25519 public key length"
    );
  }

  const spkiPrefix = new Uint8Array([
    0x30,
    0x2a,
    0x30,
    0x05,
    0x06,
    0x03,
    0x2b,
    0x65,
    0x70,
    0x03,
    0x21,
    0x00,
  ]);

  const spki = new Uint8Array(
    spkiPrefix.length + publicKeyBytes.length
  );

  spki.set(spkiPrefix, 0);
  spki.set(
    publicKeyBytes,
    spkiPrefix.length
  );

  return spki;
};

// =====================================================
// PUBLIC KEY → PROPER PEM
// =====================================================

const publicKeyToPEM = (publicKeyBytes) => {
  const spkiBytes =
    publicKeyToSPKI(publicKeyBytes);

  const base64 = bytesToBase64(spkiBytes);

  const formatted =
    base64.match(/.{1,64}/g)?.join("\n") ||
    base64;

  return `-----BEGIN PUBLIC KEY-----
${formatted}
-----END PUBLIC KEY-----`;
};

// =====================================================
// GENERATE BROWSER KEY PAIR
// =====================================================

export const generateBrowserKeyPair = async () => {
  // Generate Ed25519 private key
  const privateKey =
    ed.utils.randomSecretKey();

  // Generate matching public key
  const publicKey =
    await ed.getPublicKeyAsync(privateKey);

  return {
    privateKeyHex:
      bytesToHex(privateKey),

    publicKeyHex:
      bytesToHex(publicKey),

    publicKeyPEM:
      publicKeyToPEM(publicKey),
  };
};

// =====================================================
// SIGN DID CHALLENGE
//
// Backend expects Base64 signature.
// =====================================================

export const signDIDChallenge = async (
  challenge,
  privateKeyHex
) => {
  if (!challenge) {
    throw new Error("Challenge is required");
  }

  if (!privateKeyHex) {
    throw new Error("Private key is required");
  }

  const message =
    new TextEncoder().encode(challenge);

  const privateKey =
    hexToBytes(privateKeyHex);

  // Generate Ed25519 signature
  const signature =
    await ed.signAsync(
      message,
      privateKey
    );

  // Return Base64 directly
  return bytesToBase64(signature);
};

// =====================================================
// LOCAL DID SIGNATURE VERIFICATION
// =====================================================

export const verifyDIDSignatureLocally =
  async (
    challenge,
    signatureBase64,
    publicKeyHex
  ) => {
    try {
      const message =
        new TextEncoder().encode(
          challenge
        );

      const signature =
        base64ToBytes(signatureBase64);

      const publicKey =
        hexToBytes(publicKeyHex);

      return await ed.verifyAsync(
        signature,
        message,
        publicKey
      );
    } catch (error) {
      console.error(
        "Local DID verification error:",
        error
      );

      return false;
    }
  };

// =====================================================
// GET IDENTITIES
// =====================================================

export const getIdentities = async () => {
  try {
    const response = await fetch(
      `${API_URL}/users`,
      {
        headers: {
          Authorization:
            `Bearer ${localStorage.getItem(
              "token"
            )}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch identities"
      );
    }

    const result =
      await response.json();

    return (
      result.data ||
      result.users ||
      result
    );
  } catch (error) {
    console.error(
      "Identity API error:",
      error
    );

    return JSON.parse(
      localStorage.getItem(
        "crypta_identities"
      ) || "[]"
    );
  }
};

// =====================================================
// CREATE IDENTITY
// =====================================================

export const createIdentity = async (
  identity
) => {
  try {
    const response = await fetch(
      `${API_URL}/users`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${localStorage.getItem(
              "token"
            )}`,
        },

        body: JSON.stringify({
          name: identity.name,
          email: identity.email,
          roleId: identity.roleId,
          organization:
            identity.organization,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to create identity"
      );
    }

    return (
      result.data ||
      result.user ||
      result
    );
  } catch (error) {
    console.error(
      "Create identity API error:",
      error
    );

    const identities =
      JSON.parse(
        localStorage.getItem(
          "crypta_identities"
        ) || "[]"
      );

    const newIdentity = {
      name: identity.name,
      email: identity.email,
      role: identity.role,
      organization:
        identity.organization,

      id: Date.now().toString(),

      did:
        `did:crypta:${Date.now()}`,

      verified: false,

      status: "Pending",
    };

    identities.push(newIdentity);

    localStorage.setItem(
      "crypta_identities",
      JSON.stringify(identities)
    );

    return newIdentity;
  }
};

// =====================================================
// RESOLVE DID
// =====================================================

export const resolveDID = async (
  did
) => {
  try {
    const response = await fetch(
      `${API_URL}/users/did/${encodeURIComponent(
        did
      )}`,
      {
        headers: {
          Authorization:
            `Bearer ${localStorage.getItem(
              "token"
            )}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to resolve DID"
      );
    }

    const result =
      await response.json();

    return (
      result.data ||
      result.user ||
      result
    );
  } catch (error) {
    console.error(
      "DID resolution error:",
      error
    );

    return null;
  }
};