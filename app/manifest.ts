import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mesta — карта мест Валенсии",
    short_name: "Mesta",
    description:
      "Карта мест, открытых русскоязычными предпринимателями в Валенсии: кофейни, рестораны, услуги.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF3E9",
    theme_color: "#E8622C",
    icons: [
      { src: "/manifest-icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png" },
    ],
  };
}
