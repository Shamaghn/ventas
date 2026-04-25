"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "@/app/utils/api";
import { useRouter } from "next/navigation";

export default function NuevaVenta() {
  const router = useRouter();

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const [loadingProductos, setLoadingProductos] = useState(true);

  const impuestoPorcentaje = 0.15;

// 🔊 Sonidos POS
  const sonidoAgregar = typeof Audio !== "undefined"
    ? new Audio("add.mp3")
    : null;

  const sonidoQuitar = typeof Audio !== "undefined"
    ? new Audio("add.mp3")
    : null;

  const playAddSound = () => {
    if (sonidoAgregar) {
      sonidoAgregar.currentTime = 0;
      sonidoAgregar.play().catch(() => {});
    }
  };

  const playRemoveSound = () => {
    if (sonidoQuitar) {
      sonidoQuitar.currentTime = 0;
      sonidoQuitar.play().catch(() => {});
    }
  };


  /* =====================
     CARGAR PRODUCTOS
  ===================== */
  useEffect(() => {
  const cargarProductos = async () => {
    try {
      const data = await apiFetch("/inventario/productos");
      setProductos(data);
    } catch (error) {
      if (error.message === "UNAUTHORIZED") {
        // ✅ SOLO AQUÍ se cierra sesión
        Swal.fire({
          icon: "error",
          title: "Sesión inválida",
          text: "Por favor inicia sesión nuevamente",
          confirmButtonColor: "#ef4444",
        }).then(() => {
          localStorage.clear();
          router.push("/");
        });
      } else {
        // ✅ Error normal: NO sacar del sistema
        Swal.fire(
          "Error",
          "No se pudieron cargar los productos",
          "error"
        );
      }
    } finally {
      setLoadingProductos(false);
    }
  };

  cargarProductos();
}, [router]);

  /* =====================
     FUNCIONES POS
  ===================== */

  const obtenerCantidad = (productoId) => {
    const item = carrito.find(p => p.id === productoId);
    return item ? item.cantidad : 0;
  };

  const incrementar = (producto) => {
  const existe = carrito.find(p => p.id === producto.id);

  if (existe) {
    if (existe.cantidad >= producto.stock_actual) {
      Swal.fire("Stock insuficiente", "", "warning");
      return;
    }

    setCarrito(
      carrito.map(p =>
        p.id === producto.id
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      )
    );

    playAddSound(); // 🔊
  } else {
    setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    playAddSound(); // 🔊
  }
};

  const decrementar = (producto) => {
  const existe = carrito.find(p => p.id === producto.id);
  if (!existe) return;

  if (existe.cantidad === 1) {
    setCarrito(carrito.filter(p => p.id !== producto.id));
    playRemoveSound(); // 🔊
  } else {
    setCarrito(
      carrito.map(p =>
        p.id === producto.id
          ? { ...p, cantidad: p.cantidad - 1 }
          : p
      )
    );
    playRemoveSound(); // 🔊
  }
};

  const cambiarCantidadManual = (producto, valor) => {
    const cantidad = Number(valor);

    if (isNaN(cantidad) || cantidad < 0) return;

    if (cantidad === 0) {
      setCarrito(carrito.filter(p => p.id !== producto.id));
      return;
    }

    if (cantidad > producto.stock_actual) {
      Swal.fire("Stock insuficiente", "", "warning");
      return;
    }

    const existe = carrito.find(p => p.id === producto.id);

    if (existe) {
      setCarrito(
        carrito.map(p =>
          p.id === producto.id ? { ...p, cantidad } : p
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad }]);
    }

    playAddSound();
  };

  /* =====================
     TOTALES
  ===================== */

  const subtotal = carrito.reduce(
    (sum, p) => sum + p.cantidad * p.precio_venta,
    0
  );

  const impuestos = subtotal * impuestoPorcentaje;
  const total = subtotal - descuento + impuestos;

  const money = (n) => `L.${Number(n).toFixed(2)}`;

  /* =====================
     FINALIZAR VENTA
  ===================== */
  const finalizarVenta = async () => {
    if (carrito.length === 0) {
      Swal.fire("Agrega productos", "", "warning");
      return;
    }

    try {
      const response = await apiFetch("/ventas", {
        method: "POST",
        body: JSON.stringify({
          cliente: "Consumidor final",
          descuento,
          impuesto: impuestos,
          items: carrito.map(p => ({
            producto_id: p.id,
            cantidad: p.cantidad,
            precio: p.precio_venta,
          })),
        }),
      });

      const ventaId = response.venta_id;

      await Swal.fire({
        icon: "success",
        title: "Venta realizada",
        text: "¿Deseas descargar el comprobante?",
        showCancelButton: true,
        confirmButtonText: "Descargar",
        cancelButtonText: "Cerrar",
        confirmButtonColor: "#ef4444",
      }).then(result => {
        if (result.isConfirmed) {
          window.open(
            `http://localhost:3001/ventas/${ventaId}/ticket`,
            "_blank"
          );
        }
      });

      setCarrito([]);
      setDescuento(0);
      setBusqueda("");

      const data = await apiFetch("/inventario/productos");
      setProductos(data);
    } catch (err) {
  if (err.message === "UNAUTHORIZED") {
    Swal.fire(
      "Sesión inválida",
      "Por favor inicia sesión nuevamente",
      "error"
    ).then(() => {
      localStorage.clear();
      router.push("/");
    });
  } else {
    Swal.fire("Error", err.message, "error");
  }
}
  };

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Nueva Venta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PRODUCTOS */}
        <div className="bg-white p-4 rounded shadow">
          <input
            type="text"
            placeholder="Buscar producto..."
            className="w-full border px-3 py-2 rounded mb-4"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          {loadingProductos ? (
            <p className="text-gray-500 text-sm">Cargando productos...</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {productos
                .filter(p =>
                  p.nombre.toLowerCase().includes(busqueda.toLowerCase())
                )
                .map(p => (
                  <div
                    key={p.id}
                    className="w-full border p-3 rounded flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{p.nombre}</p>
                      <p className="text-xs text-gray-500">
                        Stock: {p.stock_actual}
                      </p>
                    </div>

                   
<div className="flex items-center gap-2">
  <button
    onClick={() => decrementar(p)}
    className="w-10 h-10 flex items-center justify-center 
               bg-red-500 text-white rounded 
               text-lg font-semibold
               hover:bg-red-600 active:scale-95"
  >
    −
  </button>


                      
  <input
    type="number"
    min="0"
    className="w-14 h-10 text-center border rounded
               text-lg
               focus:outline-none focus:ring-2 focus:ring-red-400"
    value={obtenerCantidad(p.id)}
    onChange={(e) =>
      cambiarCantidadManual(p, e.target.value)
    }
  />


                      
<button
    onClick={() => incrementar(p)}
    className="w-10 h-10 flex items-center justify-center 
               bg-red-500 text-white rounded 
               text-lg font-semibold
               hover:bg-red-600 active:scale-95"
  >
    +
  </button>

                    </div>

                    <span className="font-medium">
                      {money(p.precio_venta)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* FACTURA */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-3">Factura</h2>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-center">Cant</th>
                <th className="text-left">Producto</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {carrito.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="text-center">{p.cantidad}</td>
                  <td>{p.nombre}</td>
                  <td className="text-right">
                    {money(p.cantidad * p.precio_venta)}
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan="2">Subtotal</td>
                <td className="text-right">{money(subtotal)}</td>
              </tr>

              <tr>
                <td colSpan="2">Impuesto (15%)</td>
                <td className="text-right">{money(impuestos)}</td>
              </tr>

              <tr className="font-bold text-lg">
                <td colSpan="2">TOTAL</td>
                <td className="text-right">{money(total)}</td>
              </tr>
            </tbody>
          </table>

          <button
            onClick={finalizarVenta}
            className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            Finalizar Venta
          </button>
        </div>
      </div>
    </div>
  );
}
``