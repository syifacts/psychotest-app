"use client";

import { useToast } from "@/components/ui/use-toast";

export function useToastConfirm() {
  const { toast, dismiss } = useToast();

  const dismissLast = () => {
    const last = useToast.getState().toasts.slice(-1)[0];
    if (last) dismiss(last.id);
  };

  const confirm = (message: string, onYes: () => void) => {
    // Pastikan toast lain tidak menutup confirm
    dismissLast();

    toast({
      title: "Konfirmasi",
      description: message,
      variant: "warning",
      duration: 0,
      position: "center",
      action: (
        <div className="flex gap-2 mt-3">
          <button
            className="px-3 py-1 bg-red-600 text-white rounded"
            onClick={() => {
              dismissLast();
              onYes();
            }}
          >
            Ya
          </button>

          <button
            className="px-3 py-1 bg-gray-300 rounded"
            onClick={() => dismissLast()}
          >
            Batal
          </button>
        </div>
      ),
    });
  };

  return { confirm };
}

