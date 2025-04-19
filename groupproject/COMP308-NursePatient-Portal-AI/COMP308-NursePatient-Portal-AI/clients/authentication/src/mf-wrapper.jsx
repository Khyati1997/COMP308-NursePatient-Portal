// clients/authentication/src/mf-wrapper.jsx
import React from "react";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Wrapper() {
  console.log("[MF Wrapper] Exporting App wrapped in AuthProvider and ApolloProvider");
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ApolloProvider>
  );
}
