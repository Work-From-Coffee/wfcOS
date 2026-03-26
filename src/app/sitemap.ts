export const baseUrl = "https://workfromcoffee.com";

export default async function sitemap() {
  return [""].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));
}
