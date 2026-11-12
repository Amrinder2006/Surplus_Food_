import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import DonorDashboard from "./pages/donor/DonorDashboard.jsx";
import ReceiverDashboard from "./pages/receiver/ReceiverDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<h1>Surplus Food Saver</h1>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/donordash" element={<DonorDashboard />} />
      <Route path="/receiverdash" element={<ReceiverDashboard />} />
      <Route path="/admindash" element={<AdminDashboard />} />
    </Routes>
  </BrowserRouter>,
);
