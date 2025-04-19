// auth-frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import { AuthProvider } from "./context/AuthContext"; // ✅ IMPORTANT!
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider> {/* ✅ Fix: wrap here */}
        <App />
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
);
