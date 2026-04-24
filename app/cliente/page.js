"use client";

import { useEffect } from "react";
import { isAuth } from "../../utils/auth";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function Cliente() {

  useEffect(() => {
    if (!isAuth()) {
      window.location.href = "/";
    }
  }, []);

  return (
    <div>
      <Sidebar />
      <Navbar />

      <div style={{ marginLeft: "250px", padding: "20px" }}>
        <h2>Panel Cliente 📦</h2>
        <p>Bienvenido a tu panel</p>
      </div>
    </div>
  );
}