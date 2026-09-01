import type { MetadataRoute } from "next";
import { allCourses } from "../lib/course-data";
import { getRequestOrigin } from "../lib/request-origin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (await getRequestOrigin()).origin;
  const staticRoutes = ["", "/courses", ...allCourses.map((course) => `/courses/${course.slug}`)];
  return staticRoutes.map((path) => ({ url: `${baseUrl}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.8 }));
}
