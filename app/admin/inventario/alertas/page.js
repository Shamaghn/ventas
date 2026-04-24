"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/api";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function AlertasStockPage() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    apiFetch("/inventario/productos").then(setProductos);
  }, []);

  const criticos = productos.filter(p => p.stock_actual <= 5);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center
                        w-10 h-10 rounded-full bg-red-100">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800">
          Alertas de Stock Bajo
        </h2>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 text-left">Producto</th>
              <th className="px-6 py-4 text-right">Stock</th>
              <th className="px-6 py-4 text-center">Estado</th>
            </tr>
          </thead>

          <tbody>
            {criticos.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-6 text-center text-gray-400"
                >
                  ✅ No hay productos con stock bajo
                </td>
              </tr>
            ) : (
              criticos.map(p => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-red-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {p.nombre}
                  </td>

                  <td className="px-6 py-4 text-right
                                 font-bold text-red-600">
                    {p.stock_actual}
                  </td>

                  <td className="px-6 py-4 text-center align-middle">
  <span
    className="inline-flex items-center gap-1
               leading-none
               bg-red-100 text-red-700
               px-2 py-0.5 rounded-full
               text-xs font-semibold"
  >
 
    Stock crítico
  </span>
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
``