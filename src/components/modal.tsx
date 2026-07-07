"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  /** Rótulo exibido no topo (ex.: categoria do post) */
  label: string;
  /** URL da página completa — âncora comum para forçar navegação "dura" */
  fullHref: string;
  children: React.ReactNode;
};

export function Modal({ label, fullHref, children }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  // Sem isso, arrastar uma seleção de texto do conteúdo até o backdrop
  // dispararia um click no <dialog> e fecharia o modal no meio da leitura
  const pressOnBackdrop = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={() => router.back()}
      onPointerDown={(e) => {
        pressOnBackdrop.current = e.target === ref.current;
      }}
      onClick={(e) => {
        // Clique no backdrop: o alvo é o próprio <dialog>, não o conteúdo
        if (pressOnBackdrop.current && e.target === ref.current) {
          ref.current?.close();
        }
        pressOnBackdrop.current = false;
      }}
      className="m-auto max-h-[85dvh] w-[min(92vw,44rem)] rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl animate-modal-pop"
      aria-label={label}
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-3.5 sm:px-8">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            {label}
          </span>
          <div className="flex items-center gap-1">
            <a
              href={fullHref}
              title="Abrir página completa"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M6.5 3.5H3.5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5M9.5 2.5h4v4M13 3 7.5 8.5" />
              </svg>
              <span className="sr-only">Abrir página completa</span>
            </a>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              title="Fechar"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
              <span className="sr-only">Fechar</span>
            </button>
          </div>
        </div>
        <div className="scroll-slim min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-8 sm:px-8">
          {children}
        </div>
      </div>
    </dialog>
  );
}
