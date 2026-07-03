import { CATEGORIES } from "@/lib/feeds";
import { runRobot } from "@/lib/robot";

const INITIAL_DELAY_MS = 20_000; // primeira execução ~20s após o servidor subir
const MIN_INTERVAL_MINUTES = 5;

// Evita agendadores duplicados em hot-reload do dev server
const globalState = globalThis as unknown as {
  __robotScheduler?: { started: boolean; categoryIndex: number; running: boolean };
};

export function startScheduler(): void {
  if (process.env.ROBOT_AUTO !== "true") {
    console.log("[robô] modo automático desativado (ROBOT_AUTO != true)");
    return;
  }
  if (globalState.__robotScheduler?.started) return;

  const state = { started: true, categoryIndex: 0, running: false };
  globalState.__robotScheduler = state;

  const minutes = Math.max(
    MIN_INTERVAL_MINUTES,
    Number(process.env.ROBOT_INTERVAL_MINUTES) || 60
  );

  console.log(
    `[robô] modo automático ativo: uma categoria a cada ${minutes} min`
  );

  const tick = async () => {
    if (state.running) return; // execução anterior ainda em andamento
    state.running = true;

    const category = CATEGORIES[state.categoryIndex % CATEGORIES.length];
    state.categoryIndex++;

    try {
      console.log(`[robô] procurando notícias de "${category.label}"…`);
      const post = await runRobot(category.slug);
      console.log(`[robô] post publicado: "${post.title}" (/post/${post.slug})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`[robô] nada publicado (${category.label}): ${message}`);
    } finally {
      state.running = false;
    }
  };

  setTimeout(tick, INITIAL_DELAY_MS);
  setInterval(tick, minutes * 60 * 1000);
}
