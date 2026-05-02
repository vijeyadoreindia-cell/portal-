import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Podcasts from "./pages/Podcasts";
import Webinars from "./pages/Webinars";
import Glimpses from "./pages/Glimpses";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Podcasts />} />
              <Route path="/webinars" element={<Webinars />} />
              <Route path="/glimpses" element={<Glimpses />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </AuthProvider>
  );
}
