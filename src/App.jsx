import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import SignUp from "@/screens/signup";
import Login from "@/screens/login";
import Dashboard from "@/screens/dashboard";
import LandingPage from "@/screens/LandingPage";
import Expenses from "@/screens/expenses";
import Insights from "@/screens/insights";
import AddExpense from "@/screens/AddExpense";
import Income from "@/screens/Income";
import AddIncome from "@/screens/AddIncome";
import Asset from "@/screens/Asset";
import AddAssets from "@/components/AddAssets";
import PaymentScreen from "@/screens/PaymentScreen";

const App = () => {
  const [token, setToken] = useState(sessionStorage.getItem("token") || null);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(sessionStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/" element={token ? <Dashboard token={token} /> : <LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/expenses" element={token ? <Expenses token={token} /> : <Navigate to="/login" />} />
        <Route path="/insights" element={token ? <Insights token={token} /> : <Navigate to="/login" />} />
        <Route path="/income" element={token ? <Income token={token} /> : <Navigate to="/login" />} />
        <Route path="/addexpense" element={token ? <AddExpense token={token} /> : <Navigate to="/login" />} />
        <Route path="/addincome" element={token ? <AddIncome token={token} /> : <Navigate to="/login" />} />
        <Route path="/assets" element={token ? <Asset token={token} /> : <Navigate to="/login" />} />
        <Route path="/addassets" element={token ? <AddAssets token={token} /> : <Navigate to="/login" />} />
        <Route path="/payment" element={token ? <PaymentScreen /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
