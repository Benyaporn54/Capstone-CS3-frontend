"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, Check } from "lucide-react";

type ToastType = "success" | "error";

type ToastItem = { id: number; message: string; type: ToastType };

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

/** ครอบทั้งแอป (อยู่ใน Providers) แล้วเรียก useToast().showToast("...") */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = nextId.current++;
      // แสดงทีละไม่เกิน 3 อัน
      setToasts((current) => [...current.slice(-2), { id, message, type }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), TOAST_DURATION_MS),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-fg text-bg text-body shadow-pop pointer-events-auto flex max-w-full items-center gap-2.5 rounded-lg px-4 py-2.5"
          >
            {toast.type === "success" ? (
              <Check size={16} aria-hidden className="text-success shrink-0" />
            ) : (
              <AlertCircle
                size={16}
                aria-hidden
                className="text-error shrink-0"
              />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
