// shell/src/components/UserAppWrapper.jsx
import React from "react";
import { AuthProvider } from "authenticationApp/context/AuthContext"; // ✅ exposed from remote
import AuthenticationApp from "authenticationApp/App"; // your exposed App

const UserAppWrapper = () => {
  return (
    <AuthProvider>
      <AuthenticationApp />
    </AuthProvider>
  );
};

export default UserAppWrapper;
