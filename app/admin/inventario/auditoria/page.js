"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/utils/api";

export default function AuditoriaInventarioPage() {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    apiFetch("/inventario/productos").then(setProductos);
    apiFetch("/inventario/movimientos").then(setMovimientos);
  }, []);

  const auditoria = useMemo(() => {
    return productos.map((p) => {
      let calculado = 0;

      movimientos
        .filter((m) => m.producto_id === p.id)
        .forEach((m) => {
          const tipo = m.tipo.toUpperCase();
          if (tipo === "ENTRADA") calculado += m.cantidad;
          if (tipo === "SALIDA") calculado -= m.cantidad;
        });

      return {
        ...p,
        calculado,
        diferencia: p.stock_actual - calculado,
      };
    });
  }, [productos, movimientos]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Auditoría de Inventario</h1>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Producto</th>
            <th className="p-3">Stock Sistema</th>
            <th className="p-3">Stock Calculado</th>
            <th className="p-3">Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {auditoria.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3">{p.nombre}</td>
              <td className="p-3">{p.stock_actual}</td>
              <td className="p-3">{p.calculado}</td>
              <td className="p-3">{p.diferencia}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}