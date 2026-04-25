"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "@/app/utils/api";

export default function AuditoriaUsuariosPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    apiFetch("/auditoria/usuarios")
      .then(setLogs)
      .catch((e) => Swal.fire("Error", e.message, "error"));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Auditoría de Usuarios</h1>

      <table className="w-full text-sm bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Usuario</th>
            <th className="p-3">Acción</th>
            <th className="p-3">Entidad</th>
            <th className="p-3">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="p-3">{l.email}</td>
              <td className="p-3">{l.accion}</td>
              <td className="p-3">{l.entidad}</td>
              <td className="p-3">
                {new Date(l.fecha).toLocaleString()}
              </td>
            </tr>
          ))}

          {logs.length === 0 && (
            <tr>
              <td colSpan="4" className="p-6 text-center text-gray-400">
                No hay registros
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}