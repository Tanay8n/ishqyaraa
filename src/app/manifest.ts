import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IshqYara",
    short_name: "IshqYara",
    description: "Beyond the swipe, where dil finds its vibe. Kolkata's modern dating and social connection app.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#9e1b22",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
