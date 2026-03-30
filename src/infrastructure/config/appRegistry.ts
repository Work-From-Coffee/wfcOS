import { Size } from "@/application/types/window";
import React from "react";
import dynamic from "next/dynamic";

const Timer = dynamic(
  () => import("@/app/(timer)/Timer").then((mod) => mod.Timer),
  { ssr: false }
);
const BackgroundChanger = dynamic(
  () =>
    import("@/app/(settings)/(background)/background").then(
      (mod) => mod.BackgroundChanger
    ),
  { ssr: false }
);
const SoundChanger = dynamic(
  () => import("@/app/(settings)/(sound)/sound").then((mod) => mod.SoundChanger),
  { ssr: false }
);
const MusicPlayer = dynamic(
  () => import("@/app/(music-player)/MusicPlayer").then((mod) => mod.MusicPlayer),
  { ssr: false }
);
const TodoList = dynamic(() => import("@/app/(to-do-list)/todoList"), {
  ssr: false,
});
const AmbiencePlayer = dynamic(
  () => import("@/app/(ambience)/ambiencePlayer").then((mod) => mod.AmbiencePlayer),
  { ssr: false }
);
const Notepad = dynamic(() => import("@/app/(notepad)/Notepad"), {
  ssr: false,
});
const ChangelogWindow = dynamic(
  () =>
    import("@/presentation/components/shared/taskbar/ChangelogWindow").then(
      (mod) => mod.ChangelogWindow
    ),
  { ssr: false }
);
const Bookmark = dynamic(() => import("@/app/(bookmark)/Bookmark"), {
  ssr: false,
});
const SettingsPanel = dynamic(
  () => import("@/app/(settings)/SettingsPanel").then((mod) => mod.SettingsPanel),
  { ssr: false }
);
const SessionLogApp = dynamic(() => import("@/app/(session-log)/SessionLogApp"), {
  ssr: false,
});

interface AppRegistryEntry {
  name: string; // The display name of the app
  src: string; // Path to the app icon
  defaultSize: Size;
  minSize?: Size;
  component: React.ComponentType<any>;
  externalUrl?: string;
  hidden?: boolean; // Flag to hide app from desktop icons
}

// Settings module specific entries
export interface SettingsEntry {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  icon: string;
}

export const settingsRegistry: SettingsEntry[] = [
  {
    id: "background",
    name: "Background",
    component: BackgroundChanger,
    icon: "/icons/wallpaper.png",
  },
  {
    id: "sound",
    name: "Sound",
    component: SoundChanger,
    icon: "/icons/volume.png",
  },
];

export const appRegistry: Record<string, AppRegistryEntry> = {
  // Using appId as the key (e.g., 'pomodoro'), and name for display

  timer: {
    name: "Timer",
    src: "/icons/clock.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 400, height: 350 },
    component: Timer,
  },

  todoList: {
    name: "To-Do List",
    src: "/icons/board.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: TodoList,
  },

  ambience: {
    name: "Ambience",
    src: "/icons/ambience.png",
    defaultSize: { width: 375, height: 190 },
    minSize: { width: 375, height: 190 },
    component: AmbiencePlayer,
  },
  musicPlayer: {
    name: "Music Player",
    src: "/icons/music.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: MusicPlayer,
  },
  notepad: {
    name: "Notepad",
    src: "/icons/notepad.png",
    defaultSize: { width: 600, height: 600 },
    minSize: { width: 320, height: 400 },
    component: Notepad,
  },
  bookmark: {
    name: "Bookmark",
    src: "/icons/bookmark.png", // We'll need to ensure this icon exists
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: Bookmark,
  },
  settings: {
    name: "Settings",
    src: "/icons/settings.png",
    defaultSize: { width: 500, height: 550 },
    minSize: { width: 300, height: 300 },
    component: SettingsPanel,
  },
  changelog: {
    name: "Changelog",
    src: "/icons/default.png",
    defaultSize: { width: 500, height: 400 },
    minSize: { width: 300, height: 200 },
    component: ChangelogWindow,
    hidden: true, // Hide from desktop icons
  },
  sessionLog: {
    name: "Session Log",
    src: "/icons/default.png",
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 450, height: 300 },
    component: SessionLogApp,
    hidden: true,
  },
  findCoffeeShop: {
    name: "Find Coffee Shop",
    src: "/icons/cafe.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: SessionLogApp,
    externalUrl: "https://beta.workfromcoffee.com/",
  },
  giveTips: {
    name: "Buy Us a Coffee",
    src: "/icons/coffee.png",
    defaultSize: { width: 400, height: 600 },
    minSize: { width: 320, height: 400 },
    component: SessionLogApp,
    externalUrl: "https://workfromcoffee.gumroad.com/coffee",
  },
};

// Add other apps here using a unique key (appId);
