import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Work from Coffee OS",
    short_name: "wfcOS",
    description:
      "Offline-friendly focus workspace with Pomodoro, to-do list, notepad, bookmarks, ambience, and desktop customization.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe4",
    theme_color: "#2d2417",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
