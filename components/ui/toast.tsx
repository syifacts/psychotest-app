"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "success" | "error" | "warning"; // tambahkan variant
    position?: "top" | "center"; // default top

};

export function Toast({ className, children, variant = "success",  position = "top",
 ...props  }: ToastProps) {
  const base = "fixed z-50 top-6 left-1/2 -translate-x-1/2 rounded-lg shadow-lg px-6 py-3 animate-in fade-in-50 animate-out fade-out-50";

  const variantClasses = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-yellow-500 text-black",
  };
  const positionClasses = {
    top: "top-6 left-1/2 -translate-x-1/2",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

   return (
    <div
      {...props}
      className={cn(base, variantClasses[variant], positionClasses[position], className)} // ⚡ tambahkan positionClasses[position] di sini
    >
      {children}
    </div>
  );
}

export function ToastTitle({ children }: { children: React.ReactNode }) {
  return <p className="font-semibold">{children}</p>
}

export function ToastDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm opacity-90">{children}</p>
}

export function ToastClose() {
  return null
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function ToastViewport() {
  return null
}
