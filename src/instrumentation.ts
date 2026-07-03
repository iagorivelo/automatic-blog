export async function register() {
  // Roda apenas no servidor Node em execução (não no build nem no edge runtime)
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    const { startScheduler } = await import("@/lib/scheduler");
    startScheduler();
  }
}
