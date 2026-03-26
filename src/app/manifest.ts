import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Work from Coffee",
    short_name: "WFC",
    description:
      "Virtual desktop for deep focus with timers, notes, music, ambience, and task tracking.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f5ef",
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
