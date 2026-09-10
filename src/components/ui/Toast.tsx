'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Warning } from '@phosphor-icons/react';

type Toast = { id: number; text: string; kind: 'ok' | 'warn' };
type Ctx = { toast: (text: string, kind?: Toast['kind']) => void };

const ToastCtx = createContext<Ctx>({ toast: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const toast = useCallback((text: string, kind: Toast['kind'] = 'ok') => {
    const id = ++idRef.current;
    setItems((s) => [...s, { id, text, kind }]);
  }, []);
  useEffect(() => {
    if (items.length === 0) return;
    const t = setTimeout(() => setItems((s) => s.slice(1)), 2600);
    return () => clearTimeout(t);
  }, [items]);
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 flex flex-col items-center gap-2 px-4"
        style={{ zIndex: 'var(--z-toast)' }}
        aria-live="polite"
      >
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 24, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex items-center gap-2 rounded-full bg-ink text-paper px-4 py-2.5 text-sm shadow-xl"
            >
              {t.kind === 'ok' ? <Check size={16} weight="bold" /> : <Warning size={16} weight="bold" />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
