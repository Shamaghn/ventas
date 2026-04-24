"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { apiFetch } from "@/app/utils/api";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: HomeIcon,
    roles: ["admin", "soporte"],
  },
  {
    label: "Usuarios",
    href: "/admin/usuarios",          // ✅ NUEVO MÓDULO
    icon: UsersIcon,
    roles: ["admin"],                 // ✅ solo admin
  },
  {
    label: "Reportes",
    href: "/admin/reportes",
    icon: ChartBarIcon,
    roles: ["admin", "soporte"],
  },
  {
    label: "Inventario",
    href: "/admin/inventario",
    icon: ArchiveBoxIcon,
    roles: ["admin", "almacen"],
  },
  {
    label: "Movimientos",
    href: "/admin/inventario/movimientos",
    icon: ArrowsRightLeftIcon,
    roles: ["admin", "almacen"],
  },
  {
    label: "Kardex",
    href: "/admin/inventario/kardex",
    icon: ClipboardDocumentListIcon,
    roles: ["admin", "almacen"],
  },
  {
    label: "Auditoría",
    href: "/admin/inventario/auditoria",
    icon: ShieldCheckIcon,
    roles: ["admin"],
  },
  {
    label: "Alertas",
    href: "/admin/inventario/alertas",
    icon: ExclamationTriangleIcon,
    roles: ["admin", "almacen"],
    badge: true,
  },
  {
    label: "Venta nueva",
    href: "/admin/ventas/nueva",
    icon: ShoppingCartIcon,
    roles: ["admin", "almacen"],
  },
];

export default function Sidebar({
  open,
  setOpen,
  mobileOpen,
  setMobileOpen,
}) {
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [alertasCount, setAlertasCount] = useState(0);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setMounted(true);

    // ✅ contador de alertas (stock bajo)
    apiFetch("/inventario/productos").then(data => {
      const criticos = data.filter(p => p.stock_actual <= 5);
      setAlertasCount(criticos.length);
    });
  }, []);

  if (!mounted) return null;

  const allowedMenu = menuItems.filter(item =>
    item.roles.includes(role)
  );

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-black text-white z-40
        transition-all duration-300
        ${open ? "w-64" : "w-16"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4">
        <span className={`font-bold ${open ? "block" : "hidden"}`}>
          🚀 SaaS
        </span>

        <button
          onClick={() => setOpen(!open)}
          className="hidden lg:block"
        >
          {open ? (
            <ChevronLeftIcon className="w-5" />
          ) : (
            <ChevronRightIcon className="w-5" />
          )}
        </button>

        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden"
        >
          ✕
        </button>
      </div>

      {/* NAV */}
      <nav className="mt-4 space-y-1 px-2">
        {allowedMenu.map(item => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded transition
                ${isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800"}
              `}
            >
              <item.icon className="w-5 h-5" />

              <span className={`${open ? "block" : "hidden"} flex-1`}>
                {item.label}
              </span>

              {/* 🔴 BADGE ALERTAS */}
              {item.badge && alertasCount > 0 && open && (
                <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {alertasCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="absolute bottom-4 w-full px-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 justify-center
                     bg-red-600 py-2 rounded hover:bg-red-700"
        >
          <ArrowLeftOnRectangleIcon className="w-5" />
          <span className={`${open ? "block" : "hidden"}`}>
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}