import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "Invalid stored user:",
          error
        );

        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    if (!authToken) {
      console.error("Login token missing");
      return;
    }

    localStorage.setItem(
      "token",
      authToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear React state
    setToken(null);
    setUser(null);

    // Go back to login page
    navigate("/login", {
      replace: true,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}