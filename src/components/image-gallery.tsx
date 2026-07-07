"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  images: string[];
  /** Texto alternativo base (título do post) */
  alt: string;
  /** Compacta o herói — usado dentro do modal */
  compact?: boolean;
};

export function ImageGallery({ images, alt, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const count = images.length;
  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count]
  );

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  // Navegação por teclado e trava do scroll do fundo quando o lightbox abre
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, go]);

  if (count === 0) return null;

  const [hero, ...thumbs] = images;

  return (
    <figure className="my-8">
      <button
        type="button"
        onClick={() => openAt(0)}
        className="group relative block w-full overflow-hidden rounded-xl border border-border bg-surface"
        aria-label="Ampliar imagem"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt={alt}
          loading="lazy"
          className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
            compact ? "max-h-64" : "max-h-[26rem]"
          }`}
        />
        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M6.5 6.5h3m-1.5-1.5v3M10.5 10.5 14 14M7.5 12.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
          </svg>
          Ampliar
        </span>
      </button>

      {thumbs.length > 0 && (
        <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {thumbs.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => openAt(i + 1)}
              className="relative overflow-hidden rounded-lg border border-border bg-surface transition-opacity hover:opacity-80"
              aria-label={`Ver imagem ${i + 2} de ${count}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-fade-up"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Visualizador de imagens"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
            aria-label="Fechar"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:left-6"
                aria-label="Imagem anterior"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M10 3 5 8l5 5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:right-6"
                aria-label="Próxima imagem"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={`${alt} — imagem ${index + 1} de ${count}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] max-w-full rounded-lg object-contain shadow-2xl"
          />

          {count > 1 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {index + 1} / {count}
            </span>
          )}
        </div>
      )}
    </figure>
  );
}
