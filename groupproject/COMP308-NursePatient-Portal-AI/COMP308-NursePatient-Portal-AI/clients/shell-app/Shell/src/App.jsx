import { useQuery, gql } from "@apollo/client";
import { useState, useEffect, lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import "./styles/index.css";

const AuthenticationApp = lazy(() =>
  import("authenticationApp/App").catch((err) => {
    console.error("❌ Failed to load authenticationApp:", err);
    return { default: () => <div>Failed to load login module.</div> };
  })
);
const NursePortalApp = lazy(() => import("nursePortalApp/App"));
const PatientPortalApp = lazy(() => import("patientPortalApp/App"));

const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      id
      name
      email
      role
      vitalSigns {
        id
        bodyTemperature
        heartRate
        bloodPressure
        respiratoryRate
        date
      }
    }
  }
`;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  const { loading, error, data } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    console.log("📡 App loaded | loading =", loading, "| data =", data, "| error =", error);
    const handleLoginSuccess = (event) => {
      console.log("✅ loginSuccess in shell App.jsx:", event.detail);
      setIsLoggedIn(event.detail.isLoggedIn);
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);

    if (!loading && !error) {
      setIsLoggedIn(!!data?.currentUser);
      setRole(data?.currentUser?.role || "unknown");
    }

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
    };
  }, [loading, error, data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error! {error.message}</div>;

  console.log("🚪 Authenticated?", isLoggedIn, "| Role:", role);

  return (
    <div className="shell-app-container">
      <Suspense fallback={<div>Loading...</div>}>
        {!isLoggedIn ? (
          <AuthenticationApp />
        ) : role === "patient" ? (
          <>
            <Navbar currentAuthUser={data.currentUser} />
            <PatientPortalApp />
          </>
        ) : (
          <>
            <Navbar currentAuthUser={data.currentUser} />
            <NursePortalApp />
          </>
        )}
      </Suspense>
    </div>
  );
}

export default App;
