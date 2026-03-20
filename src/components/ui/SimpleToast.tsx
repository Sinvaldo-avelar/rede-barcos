"use client";

import { useEffect } from "react";

type SimpleToastProps = {
  message: string | null;
  variant?: "success" | "error" | "warning";
  onClose: () => void;
};

export default function SimpleToast({ message, variant = "success", onClose }: SimpleToastProps) {
  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => {
      onClose();
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) return null;

  const colorClass =
    variant === "error"
      ? "bg-red-500 border-red-500"
      : variant === "warning"
        ? "bg-amber-500 border-amber-500"
      : "bg-green-500 border-green-500";

  return (
    <div className="fixed top-4 right-4 z-[140] pointer-events-none">
      <div className={`rounded-xl text-white px-4 py-3 shadow-lg border text-sm font-bold ${colorClass}`}>
        {message}
      </div>
    </div>
  );
}
