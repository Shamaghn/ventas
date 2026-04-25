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
      let saldoCalculado = 0;

      movimientos
        .filter((m) => m.producto_id === p.id)
        .forEach((m) => {
          const tipo = m.tipo?.trim().toUpperCase();

          if (tipo === "ENTRADA") {
            saldoCalculado += Number(m.cantidad);
          }

          if (tipo === "SALIDA") {
            saldoCalculado -= Number(m.cantidad);
          }
        });

      const diferencia = p.stock_actual - saldoCalculado;

      return {
        ...p,
        saldoCalculado,
        diferencia,
      };
    });
  }, [productos, movimientos]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Auditoría de Inventario</h2>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Producto</th>
              <th className="p-3 text-right">Stock Sistema</th>
              <th className="p-3 text-right">Stock Calculado</th>
              <th className="p-3 text-right">Diferencia</th>
              <th className="p-3 text-center">Estado</th>
            </tr>
          </thead>

          <tbody>
            {auditoria.map((p) => (
              <tr
                key={p.id}
                className={`border-t ${
                  p.diferencia === 0
                    ? "bg-green-50"
                    : "bg-red-50"
                }`}
              >
                <td className="p-3">{p.nombre}</td>

                <td className="p-3 text-right">
                  {p.stock_actual}
                </td>

                <td className="p-3 text-right">
                  {p.saldoCalculado}
                </td>

                <td className="p-3 text-right font-bold">
                  {p.diferencia}
                </td>

                <td className="p-3 text-center">
                  {p.diferencia === 0
                    ? "✔ OK"
                    : "⚠ Inconsistencia"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}