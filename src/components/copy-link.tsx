"use client";

import { useEffect, useRef, useState } from "react";

export function CopyLink() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponível (ex.: contexto não seguro) — ignora
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground"
    >
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6.5 9.5a3 3 0 0 0 4.24 0l2.38-2.38a3 3 0 1 0-4.24-4.24l-1.1 1.1M9.5 6.5a3 3 0 0 0-4.24 0L2.88 8.88a3 3 0 1 0 4.24 4.24l1.1-1.1" />
      </svg>
      {copied ? "Link copiado!" : "Copiar link"}
    </button>
  );
}
