"use client"

import * as React from "react"
import { create } from "zustand"

type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  duration?: number
  className?: string
  variant?: "success" | "error" | "warning";
  position?: "top" | "center"; // default top

}

interface ToastStore {
  toasts: ToastProps[]
  toast: (toast: Omit<ToastProps, "id">) => void
  dismiss: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  toast: (toast) => {
    const id = Math.random().toString()
    const newToast = { id, ...toast }

    // Tambahkan toast
    set((state) => ({ toasts: [...state.toasts, newToast] }))

    // Auto-remove setelah duration
    if (toast.duration) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, toast.duration)
    }
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

