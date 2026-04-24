"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const login = async () => {
  setError("");

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error("Credenciales incorrectas");
    }

    const data = await res.json();

    // ✅ Guardar en el cliente
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    // ✅ Guardar cookies (middleware)
    document.cookie = `token=${data.token}; path=/`;
    document.cookie = `role=${data.user.role}; path=/`;

    // ✅ Redirigir según rol
    if (data.user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/cliente";
    }

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Acceso denegado",
      text: "Email o la contraseña son incorrectos",
      confirmButtonColor: "#ef4444",
showClass: {
  popup: "animate__animated animate__fadeInDown"
},
hideClass: {
  popup: "animate__animated animate__fadeOutUp"
}

    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ================== MITAD IZQUIERDA ================== */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#e05c52] text-white p-12">
        <div className="text-center max-w-md space-y-6">
          <h1 className="text-3xl font-semibold">
            Sistema de ventas, facturación e inventarios
          </h1>
          <p className="opacity-90">
            Dplus Software
          </p>
          <div className="text-7xl"></div>
        </div>
      </div>

      {/* ================== MITAD DERECHA ================== */}
      <div className="flex items-center justify-center bg-[#0f253f] text-white px-6">
        <div className="w-full max-w-md space-y-6">

          {/* HEADER */}

   
<div className="hidden lg:flex items-center justify-center bg-[#e05c52]">
  <img
    src="img/logo.png"
    alt="Logo SaaS"
    className="w-48"
  />
</div>

          <h2 className="text-xl font-semibold text-right">
            Tecnología Saas
          </h2>

          {/* FORM */}
          <div className="space-y-4">

            <div>
              <label className="text-xs uppercase text-gray-300">
                E-mail
              </label>
              <input
                type="email"
                placeholder="admin@test.com"
                className="w-full bg-transparent border-b border-white/30 focus:border-red-400 outline-none py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-300">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••"
                className="w-full bg-transparent border-b border-white/30 focus:border-red-400 outline-none py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">
                {error}
              </p>
            )}

            <button
              onClick={login}
              disabled={loading}
              className="mt-6 w-full bg-red-500 hover:bg-red-600 transition px-6 py-2 rounded-full text-sm font-semibold disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}