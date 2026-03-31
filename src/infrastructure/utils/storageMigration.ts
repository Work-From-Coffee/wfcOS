"use client";

const STORAGE_KEY_PREFIX = "wfcOS.";

export const STORAGE_MIGRATION_MESSAGE_TYPE = "wfcos-storage-migration";
export const STORAGE_MIGRATION_ACK_TYPE = "wfcos-storage-migration-ack";
export const STORAGE_MIGRATION_TARGET_URL =
  process.env.NEXT_PUBLIC_STORAGE_MIGRATION_TARGET_URL ||
  "http://localhost:3001";

const STANDALONE_LOCAL_STORAGE_KEYS = [
  "backgroundSettings",
  "musicPlayer",
  "soundVolumeLevel",
] as const;

export interface StorageMigrationPayload {
  type: typeof STORAGE_MIGRATION_MESSAGE_TYPE;
  version: 1;
  exportedAt: string;
  sourceOrigin: string;
  storage: Record<string, string>;
}

export interface StorageMigrationAck {
  type: typeof STORAGE_MIGRATION_ACK_TYPE;
  success: boolean;
  importedKeys?: string[];
  error?: string;
}

export function getMigratableLocalStorageEntries(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const entries: Record<string, string> = {};

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;

    const shouldInclude =
      key.startsWith(STORAGE_KEY_PREFIX) ||
      STANDALONE_LOCAL_STORAGE_KEYS.includes(
        key as (typeof STANDALONE_LOCAL_STORAGE_KEYS)[number]
      );

    if (!shouldInclude) continue;

    const value = localStorage.getItem(key);
    if (value !== null) {
      entries[key] = value;
    }
  }

  return entries;
}

export function buildStorageMigrationPayload(): StorageMigrationPayload | null {
  if (typeof window === "undefined") return null;

  return {
    type: STORAGE_MIGRATION_MESSAGE_TYPE,
    version: 1,
    exportedAt: new Date().toISOString(),
    sourceOrigin: window.location.origin,
    storage: getMigratableLocalStorageEntries(),
  };
}

export function importMigratedLocalStorageEntries(
  entries: Record<string, string>
): string[] {
  if (typeof window === "undefined") return [];

  const importedKeys: string[] = [];

  for (const [key, value] of Object.entries(entries)) {
    localStorage.setItem(key, value);
    importedKeys.push(key);
  }

  return importedKeys;
}

export function isTrustedMigrationOrigin(origin: string): boolean {
  try {
    const parsedOrigin = new URL(origin);
    const hostname = parsedOrigin.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".localhost")
    ) {
      return true;
    }

    return (
      hostname === "workfromcoffee.com" ||
      hostname.endsWith(".workfromcoffee.com")
    );
  } catch {
    return false;
  }
}
