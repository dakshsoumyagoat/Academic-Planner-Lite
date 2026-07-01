import { db } from "./db";

let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

export function getIsOnline() {
  return isOnline;
}

export function setIsOnline(value: boolean) {
  isOnline = value;
}

function normalizeUrl(input: string | URL | Request): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

export async function syncFetch(input: string | URL | Request, options?: RequestInit): Promise<Response> {
  const url = normalizeUrl(input);
  const method = (options?.method || "GET").toUpperCase();
  const body = options?.body ?? null;

  if (method === "GET" || method === "HEAD") {
    const cached = await db.readCache.get(url);
    if (isOnline) {
      try {
        const res = await fetch(input, options);
        if (res.ok) {
          const clone = res.clone();
          const text = await clone.text();
          if (text) {
            await db.readCache.put({ url, data: text, timestamp: Date.now() });
          }
        }
        return res;
      } catch {
        if (cached) {
          return new Response(cached.data, { status: 200, headers: { "content-type": "application/json", "X-Synced": "true" } });
        }
        throw new TypeError("Failed to fetch");
      }
    } else {
      if (cached) {
        return new Response(cached.data, { status: 200, headers: { "content-type": "application/json", "X-Synced": "true" } });
      }
      throw new TypeError("Offline: no cached data");
    }
  }

  // Mutating request
  if (isOnline) {
    try {
      const res = await fetch(input, options);
      if (res.ok) {
        // Invalidate affected caches
        await invalidateRelatedCaches(url);
      }
      return res;
    } catch {
      // fall through to queue
    }
  }

  // Queue the mutation
  const bodyString = body ? (typeof body === "string" ? body : JSON.stringify(body)) : "";
  await db.syncQueue.add({ method, url, body: bodyString, timestamp: Date.now(), retryCount: 0 });

  // Return a synthetic success response so React Query doesn't error
  return new Response(null, { status: 202, headers: { "X-Queued": "true" } });
}

async function invalidateRelatedCaches(url: string): Promise<void> {
  const keys = await db.readCache.toArray();
  const toDelete: string[] = [];

  if (url.includes("/tasks")) {
    for (const k of keys) if (k.url.includes("/tasks") || k.url.includes("/dashboard")) toDelete.push(k.url);
  } else if (url.includes("/tests")) {
    for (const k of keys) if (k.url.includes("/tests") || k.url.includes("/dashboard")) toDelete.push(k.url);
  } else if (url.includes("/settings")) {
    for (const k of keys) if (k.url.includes("/settings")) toDelete.push(k.url);
  }

  for (const u of toDelete) {
    await db.readCache.delete(u);
  }
}
