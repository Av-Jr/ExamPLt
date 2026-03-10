import { useState, useEffect } from "react";
import LogSign from "./LogSign.jsx";
import DashBoard from "./DashBoard.jsx";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem("authUser");
    if (cached) setUser(JSON.parse(cached));
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setUser(null);
  };

  return (
    <>
      {user ? (
        <DashBoard user={user} onLogout={handleLogout} />
      ) : (
        <LogSign onAuthSuccess={handleLogin} />
      )}
    </>
  );
}

export default App;