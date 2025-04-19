import "./styles/App.css";
import AuthenticationForm from "./components/AuthenticationForm";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, authChecked } = useAuth();

  if (!authChecked) return <p>Loading...</p>;

  return (
    <div className='micro-frontend-container'>
      {user ? (
        <p>Welcome {user.name} 🎉</p>
      ) : (
        <AuthenticationForm />
      )}
    </div>
  );
}

export default App;
