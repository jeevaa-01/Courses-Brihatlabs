import type { MetadataRoute } from "next";
import { getRequestOrigin } from "../lib/request-origin";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = (await getRequestOrigin()).origin;
  return {
    rules: { userAgent: "*", allow: ["/", "/courses"], disallow: ["/api/", "/dashboard", "/learn/", "/login"] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
