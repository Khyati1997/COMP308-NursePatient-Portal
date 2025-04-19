import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  console.log("🧪 useAuth() called from shell | context =", ctx);
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log("🔁 AuthProvider mounted in shell");
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      console.log("📦 Found user in localStorage:", storedUser);
      setUser(JSON.parse(storedUser));
    }

    const handleLoginSuccess = (event) => {
      const { user, token } = event.detail;
      console.log("📡 loginSuccess event received:", event.detail);
      if (user) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      }
      if (token) {
        localStorage.setItem("token", token);
      }
      setAuthChecked(true);
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);

    setAuthChecked(true);

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
    };
  }, []);

  const logout = () => {
    console.log("🔓 Logout triggered");
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthChecked(true);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};
