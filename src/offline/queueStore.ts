import { create } from "zustand";

import { STORAGE_KEYS } from "@/constants/app";
import { getEncryptedJson, setEncryptedJson } from "@/services/encryptedStorage";
import { getJson, setJson } from "@/services/storage";
import { QueueItem, QueueMeta } from "@/types/queue";

type QueueState = {
  hydrated: boolean;
  items: QueueItem[];
  meta: QueueMeta;
  hydrate: () => Promise<void>;
  enqueue: (item: QueueItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
  update: (id: string, updater: (item: QueueItem) => QueueItem) => Promise<void>;
  setMeta: (meta: Partial<QueueMeta>) => Promise<void>;
  replaceItems: (items: QueueItem[]) => Promise<void>;
  clear: () => Promise<void>;
};

async function persist(items: QueueItem[], meta: QueueMeta) {
  await Promise.all([
    setEncryptedJson(STORAGE_KEYS.queue, items),
    setJson(STORAGE_KEYS.queueMeta, meta)
  ]);
}

export const useQueueStore = create<QueueState>((set, get) => ({
  hydrated: false,
  items: [],
  meta: {
    syncInProgress: false,
    lastError: null
  },
  async hydrate() {
    const [items, meta] = await Promise.all([
      getEncryptedJson<QueueItem[]>(STORAGE_KEYS.queue),
      getJson<QueueMeta>(STORAGE_KEYS.queueMeta)
    ]);

    set({
      hydrated: true,
      items: items ?? [],
      meta: meta ?? { syncInProgress: false, lastError: null }
    });
  },
  async enqueue(item) {
    const nextItems = [...get().items, item];
    const nextMeta = get().meta;
    await persist(nextItems, nextMeta);
    set({ items: nextItems });
  },
  async remove(id) {
    const nextItems = get().items.filter((item) => item.id !== id);
    await persist(nextItems, get().meta);
    set({ items: nextItems });
  },
  async update(id, updater) {
    const nextItems = get().items.map((item) => (item.id === id ? updater(item) : item));
    await persist(nextItems, get().meta);
    set({ items: nextItems });
  },
  async setMeta(meta) {
    const nextMeta = {
      ...get().meta,
      ...meta
    };
    await persist(get().items, nextMeta);
    set({ meta: nextMeta });
  },
  async replaceItems(items) {
    await persist(items, get().meta);
    set({ items });
  },
  async clear() {
    await persist([], {
      syncInProgress: false,
      lastError: null
    });
    set({
      items: [],
      meta: {
        syncInProgress: false,
        lastError: null
      }
    });
  }
}));

