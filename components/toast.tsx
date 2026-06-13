"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { CheckCircle2 } from "lucide-react"

type ToastContextType = (msg: string) => void

const ToastContext = createContext<ToastContextType>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  const showToast = useCallback((message: string) => {
    setMsg(message)
    setVisible(true)
    window.clearTimeout((showToast as any)._t)
    ;(showToast as any)._t = window.setTimeout(() => setVisible(false), 2800)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[3000] -translate-x-1/2 transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[0_12px_40px_-8px] shadow-primary/50">
          <CheckCircle2 className="size-4 shrink-0" />
          {msg}
        </div>
      </div>
    </ToastContext.Provider>
  )
}
