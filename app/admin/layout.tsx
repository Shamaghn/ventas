"use client";

import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Navbar from "@/app/components/Navbar";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);       // ✅ DESKTOP
  const [mobileOpen, setMobileOpen] = useState(false); // ✅ MOBILE

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar
        open={open}
        setOpen={setOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={`
          flex flex-col flex-1 transition-all duration-300
          ${open ? "lg:ml-64" : "lg:ml-16"}
        `}
      >
        <Navbar setMobileOpen={setMobileOpen} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}