import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      return;
    }

    const demoUser = {
      id: "demo-admin-001",
      name: "CRYPTA Admin",
      email: email,
      role: "ADMIN",
      organization: "CRYPTA SHIELD",
      did: "did:crypta:admin001",
    };

    login(demoUser, "demo-token");

    navigate("/dashboard");
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

            <div className="crypta-field">

              <label htmlFor="email">
                EMAIL ADDRESS
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />

            </div>


            <div className="crypta-field">

              <label htmlFor="password">
                PASSWORD
              </label>

              <div className="crypta-password-wrapper">

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  className="crypta-eye"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                >
                  {showPassword ? "◉" : "◌"}
                </button>

              </div>

            </div>


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


            <button
              type="submit"
              className="crypta-login-button"
            >
              SECURE LOGIN
            </button>

          </form>


          <div className="crypta-security">

            <div className="crypta-security-icon">
              ◈
            </div>

            <div>
              <strong>BLOCKCHAIN SECURED</strong>

              <p>
                Your identity and transactions are
                protected by blockchain technology.
              </p>
            </div>

          </div>

        </div>


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