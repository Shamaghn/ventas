"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";

export default function Navbar({ setMobileOpen }) {
  return (
    <header className="bg-white border-b px-4 py-3 flex items-center gap-4">
      <button
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      <h1 className="font-semibold text-lg">Panel Administrativo</h1>
    </header>
  );
}
