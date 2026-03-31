import { preloadNotepadAssets } from "@/app/(notepad)/Notepad";
import { preloadSessionLogAssets } from "@/app/(session-log)/components/ChartsSection";

export const preloadOfflineModules = async () => {
  await Promise.allSettled([preloadNotepadAssets(), preloadSessionLogAssets()]);
};
