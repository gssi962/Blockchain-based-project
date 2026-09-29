import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [resetToken, setResetToken] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =====================================================
  // SEND OTP
  // =====================================================

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response =
        await forgotPassword(email.trim());

      setSuccess(
        response?.message ||
          "OTP sent successfully to your email."
      );

      setStep(2);

    } catch (err) {

      setError(
        err?.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // VERIFY RESET OTP
  // =====================================================

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be 6 digits.");
      return;
    }

    try {
      setLoading(true);

      const response =
        await verifyResetOTP(
          email.trim(),
          otp.trim()
        );

      if (!response?.resetToken) {
        setError(
          "OTP verification failed. Please try again."
        );
        return;
      }

      setResetToken(response.resetToken);

      setSuccess(
        "OTP verified successfully. Set your new password."
      );

      setStep(3);

    } catch (err) {

      setError(
        err?.response?.data?.message ||
          "Invalid or expired OTP."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (!resetToken) {
      setError(
        "Password reset session expired. Please start again."
      );
      setStep(1);
      return;
    }

    try {
      setLoading(true);

      const response =
        await resetPassword(
          email.trim(),
          resetToken,
          newPassword
        );

      setSuccess(
        response?.message ||
          "Password reset successfully."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {

      setError(
        err?.response?.data?.message ||
          "Unable to reset password. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // BACK TO LOGIN
  // =====================================================

  const handleBackToLogin = () => {
    navigate("/login");
  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="crypta-login-page">

      <div className="crypta-login-wrapper">

        <div className="crypta-login-card">

          {/* HEADING */}

          <div className="crypta-login-heading">

            <span>
              PASSWORD RECOVERY
            </span>

            <h2>
              {step === 1 &&
                "Forgot Password"}

              {step === 2 &&
                "Verify OTP"}

              {step === 3 &&
                "Reset Password"}
            </h2>

            <p>
              {step === 1 &&
                "Enter your registered email to receive OTP."}

              {step === 2 &&
                `Enter the OTP sent to ${email}.`}

              {step === 3 &&
                "Create a new password for your account."}
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div
              style={{
                marginBottom: "15px",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "14px",
                textAlign: "center",
                background: "rgba(255, 70, 70, 0.1)",
              }}
            >
              {error}
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div
              style={{
                marginBottom: "15px",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "14px",
                textAlign: "center",
                background: "rgba(0, 255, 150, 0.1)",
              }}
            >
              {success}
            </div>
          )}


          {/* =====================================================
              STEP 1 - EMAIL
          ===================================================== */}

          {step === 1 && (

            <form
              className="crypta-login-form"
              onSubmit={handleSendOTP}
            >

              <div className="crypta-field">

                <label>
                  EMAIL ADDRESS
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  disabled={loading}
                  required
                />

              </div>


              <button
                type="submit"
                className="crypta-login-button"
                disabled={loading}
              >
                {loading
                  ? "SENDING OTP..."
                  : "SEND OTP"}
              </button>

            </form>

          )}


          {/* =====================================================
              STEP 2 - OTP
          ===================================================== */}

          {step === 2 && (

            <form
              className="crypta-login-form"
              onSubmit={handleVerifyOTP}
            >

              <div className="crypta-field">

                <label>
                  ENTER OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  disabled={loading}
                  required
                />

              </div>


              <button
                type="submit"
                className="crypta-login-button"
                disabled={loading}
              >
                {loading
                  ? "VERIFYING..."
                  : "VERIFY OTP"}
              </button>


              <button
                type="button"
                className="crypta-forgot"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                disabled={loading}
              >
                CHANGE EMAIL
              </button>

            </form>

          )}


          {/* =====================================================
              STEP 3 - NEW PASSWORD
          ===================================================== */}

          {step === 3 && (

            <form
              className="crypta-login-form"
              onSubmit={handleResetPassword}
            >

              <div className="crypta-field">

                <label>
                  NEW PASSWORD
                </label>

                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  required
                />

              </div>


              <div className="crypta-field">

                <label>
                  CONFIRM PASSWORD
                </label>

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  required
                />

              </div>


              <button
                type="submit"
                className="crypta-login-button"
                disabled={loading}
              >
                {loading
                  ? "RESETTING..."
                  : "RESET PASSWORD"}
              </button>

            </form>

          )}


          {/* BACK TO LOGIN */}

          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
            }}
          >

            <button
              type="button"
              className="crypta-forgot"
              onClick={handleBackToLogin}
              disabled={loading}
            >
              BACK TO LOGIN
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;