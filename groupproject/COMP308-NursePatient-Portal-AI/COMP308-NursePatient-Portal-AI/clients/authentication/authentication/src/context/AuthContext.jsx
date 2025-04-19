import React, { createContext, useContext, useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation } from "@apollo/client";

// GraphQL Queries and Mutations
const CURRENT_USER = gql`
  query {
    currentUser {
      id
      name
      email
      role
    }
  }
`;

const LOGOUT = gql`
  mutation {
    logout
  }
`;

// Create Context
const AuthContext = createContext(null);

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [fetchUser] = useLazyQuery(CURRENT_USER, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      setUser(data.currentUser);
      setAuthChecked(true);
      console.log("[AuthContext] Logged in user:", data.currentUser);
    },
    onError: (err) => {
      console.warn("[AuthContext] Auth check failed:", err.message);
      setUser(null);
      setAuthChecked(true);
    },
  });

  const [logoutMutation] = useMutation(LOGOUT, {
    onCompleted: () => {
      console.log("[AuthContext] User logged out");
      setUser(null);
    },
    onError: (err) => {
      console.error("[AuthContext] Logout error:", err.message);
    },
  });

  const logout = () => {
    logoutMutation();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    console.log("[AuthContext] Checking login state...");
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn("⚠️ useAuth called outside AuthProvider");
    return {
      user: null,
      setUser: () => {},
      logout: () => {},
      authChecked: false,
    };
  }
  return context;
};
