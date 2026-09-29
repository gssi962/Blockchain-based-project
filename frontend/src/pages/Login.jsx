import {
  loginUser,
  generateDIDChallenge,
  enrollDIDPublicKey,
  verifyDIDSignature,
  logoutUser,
} from "../services/api";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import {
  signDIDChallenge,
  generateBrowserKeyPair,
} from "../modules/identity/services/didService";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Email and password are required"
      );
      return;
    }

    try {
      setLoading(true);

      const loginEmail =
        email.trim().toLowerCase();

      // =================================================
      // STEP 1 — PASSWORD LOGIN
      // =================================================

      const response = await loginUser(
        loginEmail,
        password
      );

      if (
        !response?.success ||
        !response?.token
      ) {
        setError(
          response?.message ||
            "Login failed"
        );
        return;
      }

      // =================================================
      // STEP 2 — FIXED ADMIN
      // =================================================

      if (
        loginEmail ===
          "crypta183@gmail.com" &&
        response.user?.role === "ADMIN"
      ) {
        const adminUser = {
          ...response.user,
          verified: true,
        };

        login(
          adminUser,
          response.token
        );

        navigate("/dashboard");

        return;
      }

      // =================================================
      // STEP 3 — LOAD EMAIL-WISE DID IDENTITIES
      // =================================================

      let identities = {};

      try {
        identities = JSON.parse(
          localStorage.getItem(
            "crypta_did_identities"
          ) || "{}"
        );
      } catch (storageError) {
        console.error(
          "DID identities storage error:",
          storageError
        );

        identities = {};
      }

      // =================================================
      // STEP 4 — GET THIS USER'S IDENTITY
      // =================================================

      let identity =
        identities[loginEmail];

      // =================================================
      // BACKWARD COMPATIBILITY
      // =================================================

      if (!identity) {
        try {
          const oldIdentity =
            JSON.parse(
              localStorage.getItem(
                "crypta_did_identity"
              ) || "null"
            );

          if (
            oldIdentity?.email
              ?.toLowerCase() ===
            loginEmail
          ) {
            identity = oldIdentity;
          }
        } catch (legacyError) {
          console.error(
            "Legacy DID identity error:",
            legacyError
          );
        }
      }

      // =================================================
      // STEP 5 — CREATE / REPAIR BROWSER DID IDENTITY
      // =================================================
      //
      // Password authentication has already succeeded.
      // If this browser does not have the user's private
      // DID key, create a fresh keypair and enroll its
      // public key for this authenticated account.
      //

      const identityMissing =
        !identity;

      const identityIncomplete =
        identity &&
        (
          !identity.privateKeyHex ||
          !identity.publicKeyHex ||
          !identity.publicKeyPEM
        );

      if (
        identityMissing ||
        identityIncomplete
      ) {
        console.log(
          "No complete browser DID identity found. Creating new DID keypair..."
        );

        const keyPair =
          await generateBrowserKeyPair();

        const enrollResponse =
          await enrollDIDPublicKey(
            keyPair.publicKeyPEM
          );

        if (
          !enrollResponse?.success
        ) {
          logoutUser();

          setError(
            enrollResponse?.message ||
              "Failed to enroll browser cryptographic identity."
          );

          return;
        }

        identity = {
          email: loginEmail,
          did:
            enrollResponse.did ||
            response.user?.did ||
            "",
          privateKeyHex:
            keyPair.privateKeyHex,
          publicKeyHex:
            keyPair.publicKeyHex,
          publicKeyPEM:
            keyPair.publicKeyPEM,
        };

        identities[loginEmail] =
          identity;

        localStorage.setItem(
          "crypta_did_identities",
          JSON.stringify(identities)
        );

        localStorage.setItem(
          "crypta_did_identity",
          JSON.stringify(identity)
        );

        console.log(
          "New browser DID identity enrolled successfully."
        );
      }

      // =================================================
      // STEP 6 — VERIFY EMAIL
      // =================================================

      if (
        identity.email?.toLowerCase() !==
        loginEmail
      ) {
        logoutUser();

        setError(
          "This browser's cryptographic identity does not match this account."
        );

        return;
      }

      // =================================================
      // STEP 7 — CHECK PRIVATE KEY
      // =================================================

      if (!identity.privateKeyHex) {
        logoutUser();

        setError(
          "Private cryptographic key not found for this account."
        );

        return;
      }

      // =================================================
      // STEP 8 — CHECK PUBLIC KEY
      // =================================================

      if (!identity.publicKeyPEM) {
        logoutUser();

        setError(
          "Public cryptographic key not found for this account."
        );

        return;
      }

      // =================================================
      // STEP 9 — GENERATE DID CHALLENGE
      // =================================================

      const challengeResponse =
        await generateDIDChallenge();

      if (
        !challengeResponse?.success ||
        !challengeResponse?.challenge
      ) {
        logoutUser();

        setError(
          challengeResponse?.message ||
            "Failed to generate DID challenge."
        );

        return;
      }

      const challenge =
        challengeResponse.challenge;

      // =================================================
      // STEP 10 — SIGN CHALLENGE
      // =================================================

      const signature =
        await signDIDChallenge(
          challenge,
          identity.privateKeyHex
        );

      if (!signature) {
        logoutUser();

        setError(
          "Failed to create cryptographic signature."
        );

        return;
      }

      // =================================================
      // STEP 11 — VERIFY DID
      // =================================================
      //
      // Backend now verifies using the public key
      // stored against this authenticated user.
      //

      const verificationResponse =
        await verifyDIDSignature(
          challenge,
          signature
        );

      if (
        !verificationResponse?.success ||
        !verificationResponse?.verified
      ) {
        logoutUser();

        setError(
          verificationResponse?.message ||
            "Cryptographic DID verification failed."
        );

        return;
      }

      // =================================================
      // STEP 12 — UPDATE LOCAL IDENTITY
      // =================================================

      identity = {
        ...identity,
        did:
          verificationResponse.did ||
          identity.did ||
          response.user?.did ||
          "",
      };

      identities[loginEmail] =
        identity;

      localStorage.setItem(
        "crypta_did_identities",
        JSON.stringify(identities)
      );

      localStorage.setItem(
        "crypta_did_identity",
        JSON.stringify(identity)
      );

      // =================================================
      // STEP 13 — COMPLETE LOGIN
      // =================================================

      const verifiedUser = {
        ...response.user,

        verified: true,

        did:
          verificationResponse.did ||
          response.user.did,
      };

      login(
        verifiedUser,
        response.token
      );

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "Login / DID verification failed:",
        error
      );

      logoutUser();

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Cryptographic login verification failed."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crypta-login-page">

      <div className="crypta-login-grid" />

      <div className="crypta-login-wrapper">

        <div className="crypta-brand">

          <div className="crypta-logo">
            ◆
          </div>

          <h1>
            CRYPTA SHIELD
          </h1>

          <p>
            BLOCKCHAIN ASSET SECURITY PLATFORM
          </p>

        </div>

        <div className="crypta-login-card">

          <div className="crypta-login-heading">

            <span>
              SECURE ACCESS
            </span>

            <h2>
              Welcome Back
            </h2>

            <p>
              Authenticate to access your secure asset ecosystem.
            </p>

          </div>

          <form
            className="crypta-login-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="crypta-field">

              <label htmlFor="email">
                EMAIL ADDRESS
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(
                    e.target.value
                  );
                  setError("");
                }}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
              />

            </div>

            {/* PASSWORD */}

            <div className="crypta-field">

              <label htmlFor="password">
                PASSWORD
              </label>

              <div className="crypta-password-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(
                      e.target.value
                    );
                    setError("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="crypta-eye"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "◉"
                    : "◌"}
                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="crypta-login-error">
                {error}
              </div>
            )}

            {/* OPTIONS */}

            <div className="crypta-login-options">

              <label className="crypta-remember">

                <input type="checkbox" />

                <span>
                  Remember me
                </span>

              </label>

              <button
  type="button"
  className="crypta-forgot"
  onClick={() =>
    navigate("/forgot-password")
  }
>
  Forgot Password?
</button>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="crypta-login-button"
              disabled={loading}
            >
              {loading
                ? "AUTHENTICATING..."
                : "SECURE LOGIN"}
            </button>

            {/* REGISTER */}

            <div
              style={{
                textAlign: "center",
                marginTop: "18px",
                fontSize: "13px",
                color:
                  "var(--text-secondary)",
              }}
            >
              Don't have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  navigate("/register")
                }
                style={{
                  background: "none",
                  border: "none",
                  color:
                    "var(--gold-light)",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Register
              </button>

            </div>

          </form>

          {/* SECURITY */}

          <div className="crypta-security">

            <div className="crypta-security-icon">
              ◈
            </div>

            <div>

              <strong>
                BLOCKCHAIN SECURED
              </strong>

              <p>
                Your identity and transactions are
                protected by blockchain technology.
              </p>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="crypta-login-footer">

          CRYPTA SHIELD

          <span>•</span>

          SECURE DIGITAL ECOSYSTEM

        </div>

      </div>

    </div>
  );
}

export default Login;