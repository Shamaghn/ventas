"use client";

import Link from "next/link";

export default function Admin() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* TÍTULO */}
      <h2 className="text-xl sm:text-2xl font-bold mb-6">
        Dashboard Admin 👑
      </h2>

      {/* GRID KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* INVENTARIO */}
        <Link href="/admin/inventario">
          <div className="bg-white shadow rounded-lg p-5 hover:shadow-md transition cursor-pointer">
            <p className="text-gray-500 text-sm">Productos activos</p>
            <p className="text-3xl font-bold mt-2">120</p>
            <p className="text-xs text-gray-400 mt-1">
              Ver inventario →
            </p>
          </div>
        </Link>

        {/* VENTAS */}
        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-gray-500 text-sm">Ventas del mes</p>
          <p className="text-3xl font-bold mt-2">$5,000</p>
          <p className="text-xs text-gray-400 mt-1">
            Próximo módulo
          </p>
        </div>

        {/* MOVIMIENTOS */}
        <Link href="/admin/inventario/movimientos">
          <div className="bg-white shadow rounded-lg p-5 hover:shadow-md transition cursor-pointer">
            <p className="text-gray-500 text-sm">Movimientos</p>
            <p className="text-3xl font-bold mt-2">75</p>
            <p className="text-xs text-gray-400 mt-1">
              Ver movimientos →
            </p>
          </div>
        </Link>

      </div>

      {/* MENSAJE INFERIOR */}
      <div className="mt-10 bg-white rounded-lg shadow p-6 text-gray-600">
        <p className="text-sm">
          ✅ El inventario está conectado al sistema de ventas y contabilidad.  
          Cada movimiento impacta directamente en reportes y facturación.
        </p>
      </div>

    </div>
  );
}