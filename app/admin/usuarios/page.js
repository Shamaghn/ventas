"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "@/app/utils/api";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // ✅ ID del usuario logueado (para no permitir eliminarse)
  const currentUserId = Number(localStorage.getItem("user_id"));

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "cliente",
  });

  /* =====================
     CARGAR USUARIOS
  ===================== */
  const cargarUsuarios = async () => {
    try {
      const data = await apiFetch("/usuarios");
      setUsuarios(data);
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  /* =====================
     GUARDAR USUARIO
  ===================== */
  const guardarUsuario = async () => {
    if (!form.email || (!editId && !form.password)) {
      Swal.fire("Completa todos los campos", "", "warning");
      return;
    }

    try {
      if (editId) {
        // EDITAR
        await apiFetch(`/usuarios/${editId}`, {
          method: "PUT",
          body: JSON.stringify({
            email: form.email,
            role: form.role,
          }),
        });
      } else {
        // CREAR
        await apiFetch("/usuarios", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }

      setModalOpen(false);
      setEditId(null);
      setForm({ email: "", password: "", role: "cliente" });
      cargarUsuarios();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    }
  };

  /* =====================
     ELIMINAR USUARIO
  ===================== */
  const eliminarUsuario = async (id) => {
    const r = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
    });

    if (r.isConfirmed) {
      try {
        await apiFetch(`/usuarios/${id}`, { method: "DELETE" });
        cargarUsuarios();
      } catch (e) {
        Swal.fire("Error", e.message, "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Usuarios</h1>
        <button
          onClick={() => {
            setModalOpen(true);
            setEditId(null);
            setForm({ email: "", password: "", role: "cliente" });
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-black transition"
        >
          + Usuario
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Rol</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const isCurrentUser = u.id === currentUserId;

              return (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 text-center">{u.role}</td>

                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-4">
                      {/* BOTÓN EDITAR */}
                      <button
                        onClick={() => {
                          setEditId(u.id);
                          setForm({
                            email: u.email,
                            password: "",
                            role: u.role,
                          });
                          setModalOpen(true);
                        }}
                        className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-black transition"
                      >
                        ✏️ Editar
                      </button>

                      {/* BOTÓN ELIMINAR */}
                      <button
                        onClick={() => eliminarUsuario(u.id)}
                        disabled={isCurrentUser}
                        title={
                          isCurrentUser
                            ? "No puedes eliminar tu propio usuario"
                            : "Eliminar usuario"
                        }
                        className={`flex items-center gap-1 px-4 py-2 rounded transition
                          ${
                            isCurrentUser
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-black"
                          }`}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {usuarios.length === 0 && (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-400">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 space-y-3">
            <h3 className="font-bold">
              {editId ? "Editar Usuario" : "Nuevo Usuario"}
            </h3>

            <input
              className="border p-2 w-full"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            {!editId && (
              <input
                className="border p-2 w-full"
                type="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            )}

            <select
              className="border p-2 w-full"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="admin">Admin</option>
              <option value="almacen">Almacén</option>
              <option value="cliente">Cliente</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-black transition"
                onClick={guardarUsuario}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}