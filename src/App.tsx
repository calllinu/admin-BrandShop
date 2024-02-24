import { ConfigProvider } from "antd";
import { Routes, BrowserRouter, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./../src/firebaseConfig/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import Admin from "./admin/admin-pannel";
import Login from "./auth/login/login";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedAuthState = localStorage.getItem("isAuthenticated");
    return storedAuthState ? JSON.parse(storedAuthState) : false;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      const isAuthenticated = !!user;
      setIsAuthenticated(isAuthenticated);
      localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
    });

    return () => unsubscribe();
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Campton",
          fontSize: 15,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="*" element={isAuthenticated ? <Admin /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
