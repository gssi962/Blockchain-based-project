import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  registerUser,
  verifyEmailOTP,
  resendEmailOTP,
} from "../services/api";

import {
  generateBrowserKeyPair,
} from "../modules/identity/services/didService";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [otp, setOtp] = useState("");

  const [showOTP, setShowOTP] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [otpLoading, setOtpLoading] = useState(false);

  const [resendLoading, setResendLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // REGISTER
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please fill all fields."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail =
        email.trim().toLowerCase();

      // =================================================
      // GENERATE ED25519 KEY PAIR
      // =================================================

      const keyPair =
        await generateBrowserKeyPair();

      // =================================================
      // REGISTER USER
      // =================================================
      // Public key goes to backend.
      // Private key stays only in browser.
      // =================================================

      const response =
        await registerUser({
          name: name.trim(),
          email: normalizedEmail,
          password,
          publicKey:
            keyPair.publicKeyPEM,
        });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Registration failed"
        );
      }

      // =================================================
      // STORE DID IDENTITY
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
          "Identity storage parsing error:",
          storageError
        );

        identities = {};
      }

      identities[normalizedEmail] = {
        email: normalizedEmail,

        did:
          response.user?.did || "",

        privateKeyHex:
          keyPair.privateKeyHex,

        publicKeyHex:
          keyPair.publicKeyHex,

        publicKeyPEM:
          keyPair.publicKeyPEM,
      };

      localStorage.setItem(
        "crypta_did_identities",
        JSON.stringify(identities)
      );

      // =================================================
      // CURRENT IDENTITY COMPATIBILITY
      // =================================================

      localStorage.setItem(
        "crypta_did_identity",
        JSON.stringify(
          identities[normalizedEmail]
        )
      );

      // =================================================
      // SHOW OTP SCREEN
      // =================================================

      setEmail(normalizedEmail);

      setShowOTP(true);

      setSuccess(
        `OTP sent to ${normalizedEmail}. Please check your Gmail.`
      );

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError(
        "Please enter the OTP."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError(
        "OTP must be a 6-digit number."
      );
      return;
    }

    try {
      setOtpLoading(true);

      const normalizedEmail =
        email.trim().toLowerCase();

      const response =
        await verifyEmailOTP(
          normalizedEmail,
          otp.trim()
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "OTP verification failed."
        );
      }

      setSuccess(
        "Email verified successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (err) {
      console.error(
        "OTP verification error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Invalid or expired OTP."
      );

    } finally {
      setOtpLoading(false);
    }
  };

  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");

    try {
      setResendLoading(true);

      const normalizedEmail =
        email.trim().toLowerCase();

      const response =
        await resendEmailOTP(
          normalizedEmail
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to resend OTP."
        );
      }

      setOtp("");

      setSuccess(
        "A new OTP has been sent to your Gmail."
      );

    } catch (err) {
      console.error(
        "Resend OTP error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to resend OTP."
      );

    } finally {
      setResendLoading(false);
    }
  };

  // =====================================================
  // OTP SCREEN
  // =====================================================

  if (showOTP) {
    return (
      <div className="crypta-login-page">

        <div className="crypta-login-grid" />

        <div className="crypta-login-wrapper">

          {/* BRAND */}

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

          {/* OTP CARD */}

          <div className="crypta-login-card">

            <div className="crypta-login-heading">

              <span>
                EMAIL VERIFICATION
              </span>

              <h2>
                Verify Your Email
              </h2>

              <p>
                Enter the 6-digit OTP sent to
                <br />
                <strong>
                  {email}
                </strong>
              </p>

            </div>

            <form
              className="crypta-login-form"
              onSubmit={handleVerifyOTP}
            >

              {/* OTP */}

              <div className="crypta-field">

                <label htmlFor="otp">
                  VERIFICATION CODE
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  disabled={otpLoading}
                  autoFocus
                />

              </div>

              {/* ERROR */}

              {error && (
                <div
                  style={{
                    color:
                      "var(--danger)",
                    fontSize: "13px",
                    marginTop: "4px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div
                  style={{
                    color:
                      "var(--gold-light)",
                    fontSize: "13px",
                    marginTop: "4px",
                  }}
                >
                  {success}
                </div>
              )}

              {/* VERIFY BUTTON */}

              <button
                type="submit"
                className="crypta-login-button"
                disabled={otpLoading}
              >
                {otpLoading
                  ? "VERIFYING..."
                  : "VERIFY EMAIL"}
              </button>

            </form>

            {/* RESEND */}

            <div
              style={{
                textAlign: "center",
                marginTop: "18px",
                fontSize: "13px",
                color:
                  "var(--text-secondary)",
              }}
            >
              Didn't receive the OTP?{" "}

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                style={{
                  background: "none",
                  border: "none",
                  color:
                    "var(--gold-light)",
                  cursor: resendLoading
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "600",
                }}
              >
                {resendLoading
                  ? "SENDING..."
                  : "Resend OTP"}
              </button>

            </div>

            {/* BACK TO REGISTER */}

            <div
              style={{
                textAlign: "center",
                marginTop: "12px",
                fontSize: "13px",
                color:
                  "var(--text-secondary)",
              }}
            >
              Wrong email?{" "}

              <button
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color:
                    "var(--gold-light)",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Go Back
              </button>

            </div>

            {/* SECURITY */}

            <div className="crypta-security">

              <div className="crypta-security-icon">
                ◈
              </div>

              <div>

                <strong>
                  EMAIL VERIFIED SECURITY
                </strong>

                <p>
                  Your account email must be
                  verified before accessing
                  the secure ecosystem.
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

  // =====================================================
  // NORMAL REGISTER SCREEN
  // =====================================================

  return (
    <div className="crypta-login-page">

      <div className="crypta-login-grid" />

      <div className="crypta-login-wrapper">

        {/* BRAND */}

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

        {/* REGISTER CARD */}

        <div className="crypta-login-card">

          <div className="crypta-login-heading">

            <span>
              SECURE REGISTRATION
            </span>

            <h2>
              Create Account
            </h2>

            <p>
              Register to access your secure asset ecosystem.
            </p>

          </div>

          <form
            className="crypta-login-form"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}

            <div className="crypta-field">

              <label htmlFor="name">
                FULL NAME
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Enter your full name"
                disabled={loading}
              />

            </div>

            {/* EMAIL */}

            <div className="crypta-field">

              <label htmlFor="email">
                EMAIL ADDRESS
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="Enter your email"
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
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Create a password"
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
                >
                  {showPassword
                    ? "◉"
                    : "◌"}
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="crypta-field">

              <label htmlFor="confirmPassword">
                CONFIRM PASSWORD
              </label>

              <div className="crypta-password-wrapper">

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="crypta-eye"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                >
                  {showConfirmPassword
                    ? "◉"
                    : "◌"}
                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div
                style={{
                  color:
                    "var(--danger)",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                style={{
                  color:
                    "var(--gold-light)",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                {success}
              </div>
            )}

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              className="crypta-login-button"
              disabled={loading}
            >
              {loading
                ? "CREATING ACCOUNT..."
                : "CREATE ACCOUNT"}
            </button>

          </form>

          {/* LOGIN LINK */}

          <div
            style={{
              textAlign: "center",
              marginTop: "18px",
              fontSize: "13px",
              color:
                "var(--text-secondary)",
            }}
          >
            Already have an account?{" "}

            <button
              type="button"
              onClick={() =>
                navigate("/login")
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
              Login
            </button>

          </div>

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
                Your identity and transactions
                are protected by blockchain
                technology.
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

export default Register;