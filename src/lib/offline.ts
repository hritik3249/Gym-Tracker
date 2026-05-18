type QueueItem = {
  id: string;
  url: string;
  method: "POST" | "PATCH" | "DELETE";
  body?: unknown;
  createdAt: string;
};

const DB_NAME = "liftloop-offline";
const STORE_NAME = "queue";

function openQueueDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openQueueDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = action(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
}

export async function enqueueOfflineRequest(item: Omit<QueueItem, "id" | "createdAt">) {
  if (typeof indexedDB === "undefined") return;

  await withStore("readwrite", (store) =>
    store.put({
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }),
  );
}

export async function syncOfflineQueue() {
  if (typeof indexedDB === "undefined" || typeof navigator === "undefined" || !navigator.onLine) return;

  const items = await withStore<QueueItem[]>("readonly", (store) => store.getAll());
  for (const item of items) {
    const response = await fetch(item.url, {
      method: item.method,
      headers: { "content-type": "application/json" },
      body: item.body ? JSON.stringify(item.body) : undefined,
    });

    if (response.ok) {
      await withStore("readwrite", (store) => store.delete(item.id));
    }
  }
}

export async function resilientFetch(url: string, init: RequestInit & { json?: unknown }) {
  const body = init.json ? JSON.stringify(init.json) : init.body;

  try {
    const response = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json", ...(init.headers ?? {}) },
      body,
    });

    if (!response.ok) throw new Error("Request failed");
    return response;
  } catch (error) {
    if (init.method === "POST" || init.method === "PATCH" || init.method === "DELETE") {
      await enqueueOfflineRequest({
        url,
        method: init.method,
        body: init.json,
      });
    }

    throw error;
  }
}
