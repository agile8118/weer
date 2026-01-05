import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";

if (cluster.isPrimary) {
  console.log(`[Primary] Running with PID ${process.pid}`);

  const coreCount = availableParallelism();
  console.log(
    `[Primary] Spawning ${coreCount} workers for maximum performance...`
  );

  for (let i = 0; i < coreCount; i++) {
    const worker = cluster.fork();
  }

  // Self-healing: If a worker dies, spin up a new one immediately
  cluster.on("exit", (worker, code, signal) => {
    const exitReason = signal || `code ${code}`;
    console.error(
      `[Worker ${worker.process.pid}] Died (${exitReason}). Restarting...`
    );
    cluster.fork();
  });
} else {
  await import("./index.js");
}
