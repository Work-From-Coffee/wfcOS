import { siteUrl } from "@/infrastructure/config/site";

export default async function sitemap() {
  return [""].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));
}
