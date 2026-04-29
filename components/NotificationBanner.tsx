"use client";

import { useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

interface Props {
  notifications: Notification[];
}

export default function NotificationBanner({ notifications }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  const visible = notifications.filter((n) => !dismissed.has(n.id));

  if (visible.length === 0) return null;

  async function markAsRead(id: string) {
    setLoading(id);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setDismissed((prev) => new Set([...prev, id]));
    } catch {
      // sessizce geç
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {visible.map((n) => (
        <div
          key={n.id}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <p className="text-sm font-bold text-red-700">{n.title}</p>
            </div>
            <span className="text-[10px] text-red-400 flex-shrink-0 mt-0.5">
              {new Date(n.created_at).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <p className="text-xs text-red-600 whitespace-pre-line leading-relaxed">
            {n.message}
          </p>

          <button
            onClick={() => markAsRead(n.id)}
            disabled={loading === n.id}
            className="self-end text-[11px] font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition disabled:opacity-40"
          >
            {loading === n.id ? "..." : "Gördüm ✓"}
          </button>
        </div>
      ))}
    </div>
  );
}