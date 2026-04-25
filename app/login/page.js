"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor ingresa el correo y la contraseña",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await res.json();

      // ✅ GUARDAR SESIÓN COMPLETA
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("empresa_id", data.user.empresa_id);
      localStorage.setItem("user_id", data.user.id);

      // ✅ Cookies (middleware)
      document.cookie = `token=${data.token}; path=/`;
      document.cookie = `role=${data.user.role}; path=/`;

      // ✅ Redirección
      window.location.href =
        data.user.role === "admin" ? "/admin" : "/cliente";

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "Email o contraseña incorrectos",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* IZQUIERDA */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#e05c52] text-white p-12">
        <h1 className="text-3xl font-semibold text-center">
          Sistema de Ventas e Inventarios
        </h1>
        <p className="opacity-90 mt-4">Dplus Software</p>
      </div>

      {/* DERECHA */}
      <div className="flex items-center justify-center bg-[#0f253f] text-white px-6">
        <div className="w-full max-w-md space-y-6">

          <div className="flex justify-center">
            <img src="/img/logo.png" alt="Logo" className="w-48" />
          </div>

          <h2 className="text-xl font-semibold text-center">
            Tecnología SaaS
          </h2>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="admin@test.com"
              className="w-full bg-transparent border-b border-white/30 py-2 outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="••••••"
              className="w-full bg-transparent border-b border-white/30 py-2 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-full font-semibold disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}