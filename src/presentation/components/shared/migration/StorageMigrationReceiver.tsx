"use client";

import { useEffect } from "react";
import {
  importMigratedLocalStorageEntries,
  isTrustedMigrationOrigin,
  STORAGE_MIGRATION_ACK_TYPE,
  STORAGE_MIGRATION_MESSAGE_TYPE,
  type StorageMigrationAck,
  type StorageMigrationPayload,
} from "@/infrastructure/utils/storageMigration";

export const StorageMigrationReceiver = () => {
  useEffect(() => {
    const handleMigrationMessage = (
      event: MessageEvent<StorageMigrationPayload>
    ) => {
      if (!isTrustedMigrationOrigin(event.origin)) return;
      if (event.data?.type !== STORAGE_MIGRATION_MESSAGE_TYPE) return;

      let response: StorageMigrationAck;

      try {
        const importedKeys = importMigratedLocalStorageEntries(
          event.data.storage ?? {}
        );

        response = {
          type: STORAGE_MIGRATION_ACK_TYPE,
          success: true,
          importedKeys,
        };

        window.dispatchEvent(
          new CustomEvent("wfcos-storage-migration-complete", {
            detail: {
              importedKeys,
              exportedAt: event.data.exportedAt,
              sourceOrigin: event.data.sourceOrigin,
            },
          })
        );

        sessionStorage.setItem(
          "wfcosMigrationResult",
          JSON.stringify({
            importedKeys,
            exportedAt: event.data.exportedAt,
            sourceOrigin: event.data.sourceOrigin,
          })
        );
      } catch (error) {
        response = {
          type: STORAGE_MIGRATION_ACK_TYPE,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to import migrated storage data.",
        };
      }

      const sourceWindow = event.source as WindowProxy | null;
      sourceWindow?.postMessage(response, event.origin);

      if (response.success) {
        window.setTimeout(() => {
          window.location.reload();
        }, 150);
      }
    };

    window.addEventListener("message", handleMigrationMessage);
    return () => window.removeEventListener("message", handleMigrationMessage);
  }, []);

  return null;
};
