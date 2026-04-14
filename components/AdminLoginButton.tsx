"use client";

import { useState } from "react";
import { AdminLoginModal } from "./AdminLoginModal";

export function AdminLoginButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 active:scale-95 transition-all duration-150 whitespace-nowrap"
      >
        🔑 Admin
      </button>
      <AdminLoginModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
