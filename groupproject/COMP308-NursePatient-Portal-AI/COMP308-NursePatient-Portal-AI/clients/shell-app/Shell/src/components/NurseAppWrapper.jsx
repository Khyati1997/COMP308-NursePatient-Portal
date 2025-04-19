// shell/src/components/NurseAppWrapper.jsx
import React from "react";
import { AuthProvider } from "authenticationApp/context/AuthContext"; // ✅ remote shared context
import NursePortalApp from "nursePortalApp/App";

const NurseAppWrapper = () => {
  return (
    <AuthProvider>
      <NursePortalApp />
    </AuthProvider>
  );
};

export default NurseAppWrapper;
