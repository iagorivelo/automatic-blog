"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PostActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublished() {
    setBusy(true);
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!confirm("Excluir este post permanentemente?")) return;
    setBusy(true);
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex shrink-0 items-center gap-2 text-xs">
      <button
        onClick={togglePublished}
        disabled={busy}
        className="rounded-md border border-border px-2.5 py-1.5 text-muted hover:border-foreground hover:text-foreground disabled:opacity-50 transition-colors"
      >
        {published ? "Despublicar" : "Publicar"}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="rounded-md border border-border px-2.5 py-1.5 text-muted hover:border-red-500 hover:text-red-500 disabled:opacity-50 transition-colors"
      >
        Excluir
      </button>
    </div>
  );
}

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-foreground hover:text-foreground transition-colors"
    >
      Sair
    </button>
  );
}
