export const PUBLIC_COURSE_CACHE = "public, max-age=60, s-maxage=300, stale-while-revalidate=86400";

export const publicCourseHeaders = {
  "Cache-Control": PUBLIC_COURSE_CACHE,
  "X-Content-Type-Options": "nosniff",
};

export const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
