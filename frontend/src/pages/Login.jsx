import { loginUser } from "../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(email, password);
if (response.success && response.token) {
  login(response.user, response.token);
  navigate("/dashboard");
} else {
  setError(response.message || "Login failed");
}
    } catch (error) {
      console.error("Login failed:", error);

      setError(
        error.response?.data?.message ||
        "Invalid email or password"
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
          <div className="crypta-logo">◆</div>

          <h1>CRYPTA SHIELD</h1>

          <p>BLOCKCHAIN ASSET SECURITY PLATFORM</p>
        </div>

        <div className="crypta-login-card">

          <div className="crypta-login-heading">
            <span>SECURE ACCESS</span>

            <h2>Welcome Back</h2>

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
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter your email"
                autoComplete="email"
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="crypta-eye"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "◉" : "◌"}
                </button>

              </div>

            </div>


            {/* ERROR MESSAGE */}

            {error && (
              <div className="crypta-login-error">
                {error}
              </div>
            )}


            {/* OPTIONS */}

            <div className="crypta-login-options">

              <label className="crypta-remember">

                <input type="checkbox" />

                <span>Remember me</span>

              </label>

              <button
                type="button"
                className="crypta-forgot"
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

          </form>


          {/* SECURITY MESSAGE */}

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