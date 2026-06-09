"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

type ToastItem = { id: string; message: string; type: "success" | "error" };
type ToastCtx = { toast: (message: string, type?: "success" | "error") => void };

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastItem["type"] = "success") => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 space-y-2 lg:bottom-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="animate-fade-up flex items-center gap-2 whitespace-nowrap rounded-xl border border-line bg-panel px-4 py-3 text-sm font-semibold text-cream shadow-card backdrop-blur-xl"
          >
            {item.type === "success" ? (
              <CheckCircle size={16} className="shrink-0 text-mint" />
            ) : (
              <XCircle size={16} className="shrink-0 text-ember" />
            )}
            {item.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
