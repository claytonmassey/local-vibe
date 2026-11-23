import fs from "node:fs";
import path from "node:path";
import { SEED_VERSION, type Store } from "./model";
import { seedStore } from "./seed";

const file = path.join(process.cwd(), "data", "runtime-store.json");

const globalStore = globalThis as unknown as { __marketmap?: Store };

function load(): Store {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Store;
    if (parsed.seedVersion !== SEED_VERSION) return persist(seedStore());
    return parsed;
  } catch {
    return persist(seedStore());
  }
}

function persist(store: Store): Store {
  globalStore.__marketmap = store;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(store));
  } catch {
    // Serverless filesystems are read-only. The warm instance keeps the seed in memory.
  }
  return store;
}

export function readStore(): Store {
  if (!globalStore.__marketmap || globalStore.__marketmap.seedVersion !== SEED_VERSION) {
    globalStore.__marketmap = load();
  }
  return globalStore.__marketmap;
}

export function updateStore<T>(mutate: (store: Store) => T): T {
  const store = readStore();
  const result = mutate(store);
  persist(store);
  return result;
}

export function resetStore(): Store {
  try {
    fs.rmSync(file, { force: true });
  } catch {
    // ignore
  }
  globalStore.__marketmap = undefined;
  return readStore();
}
