import { db } from "./db";
import { setIsOnline } from "./sync-fetch";

let syncIntervalId: ReturnType<typeof setInterval> | null = null;

export function startSyncEngine() {
  const sync = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }
    setIsOnline(true);

    const queue = await db.syncQueue.orderBy("timestamp").toArray();
    if (queue.length === 0) return;

    for (const item of queue) {
      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: { "content-type": "application/json" },
          body: item.body || undefined,
        });
        if (res.ok || res.status === 204) {
          await db.syncQueue.delete(item.id as number);
        } else {
          // Retry later
          await db.syncQueue.update(item.id as number, { retryCount: item.retryCount + 1 });
        }
      } catch {
        setIsOnline(false);
        break;
      }
    }
  };

  // Sync on start and every 5 seconds when online
  sync();
  syncIntervalId = setInterval(sync, 5000);

  window.addEventListener("online", () => {
    setIsOnline(true);
    sync();
  });

  window.addEventListener("offline", () => {
    setIsOnline(false);
  });
}

export function stopSyncEngine() {
  if (syncIntervalId) clearInterval(syncIntervalId);
}

export function getPendingCount(): Promise<number> {
  return db.syncQueue.count();
}
