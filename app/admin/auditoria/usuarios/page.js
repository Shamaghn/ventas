"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "@/app/utils/api";

export default function AuditoriaUsuariosPage() {
  const [logs, setLogs] = useState([]);

  /* =====================
     CARGAR AUDITORÍA
  ===================== */
  const cargarAuditoria = async () => {
    try {
      const data = await apiFetch("/auditoria/usuarios");
      setLogs(data);
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    }
  };

  useEffect(() => {
    cargarAuditoria();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Auditoría de Usuarios</h1>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-center">Acción</th>
              <th className="p-3 text-center">Entidad</th>
              <th className="p-3 text-center">Fecha</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{l.email}</td>
                <td className="p-3 text-center">
                  <span
                    className={`
                      px-2 py-1 rounded text-xs font-semibold
                      ${
                        l.accion === "CREAR"
                          ? "bg-green-100 text-green-700"
                          : l.accion === "EDITAR"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {l.accion}
                  </span>
                </td>
                <td className="p-3 text-center">{l.entidad}</td>
                <td className="p-3 text-center">
                  {new Date(l.fecha).toLocaleString()}
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  No hay registros de auditoría
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}