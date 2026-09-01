import assert from "node:assert/strict";
import test from "node:test";

const workerPromise = import(new URL("../dist/server/index.js", import.meta.url).href).then((module) => module.default);

async function render(path, headers = {}, method = "GET") {
  const worker = await workerPromise;
  return worker.fetch(new Request(`http://localhost${path}`, { headers, method, redirect: "manual" }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("public course workflow pages render", async () => {
  for (const path of ["/", "/courses", "/courses/data-analytics"]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /Courses/);
    assert.match(html, /main-content/);
  }
});

test("course APIs expose modules, lessons, two projects, and cache policy", async () => {
  const catalogResponse = await render("/api/courses");
  assert.equal(catalogResponse.status, 200);
  assert.match(catalogResponse.headers.get("cache-control") || "", /s-maxage=300/);
  const catalog = await catalogResponse.json();
  assert.ok(catalog.courses.length > 0);
  for (const course of catalog.courses) {
    assert.equal(course.projectCount, 2, course.slug);
    const curriculumResponse = await render(`/api/courses/${course.id}/curriculum`);
    assert.equal(curriculumResponse.status, 200, course.slug);
    const curriculum = await curriculumResponse.json();
    assert.equal(curriculum.modules.length, course.moduleCount, course.slug);
    assert.equal(curriculum.projects.length, 2, course.slug);
    assert.ok(curriculum.modules.every((module) => module.lessons.length > 0));
    assert.ok(curriculum.projects.every((project) => project.prerequisiteUnitIds.length > 0));
  }
});

test("course detail is lightweight and full content is opt-in", async () => {
  const summary = await render("/api/courses/data-analytics");
  assert.equal(summary.status, 200);
  const summaryBody = await summary.json();
  assert.equal(summaryBody.course.id, "data-analytics");
  assert.equal("units" in summaryBody.course, false);
  const content = await render("/api/courses/data-analytics?include=content");
  assert.equal(content.status, 200);
  const contentBody = await content.json();
  assert.ok(Array.isArray(contentBody.course.units));
});

test("enrollment, progress, and project completion APIs require identity", async () => {
  for (const path of [
    "/api/courses/data-analytics/enroll",
    "/api/courses/data-analytics/progress",
    "/api/users/me/enrollments",
    "/api/projects/retail-sales-analysis/complete",
  ]) {
    const response = await render(path, { "content-type": "application/json" }, path.endsWith("/enroll") || path.endsWith("/complete") ? "POST" : "GET");
    assert.equal(response.status, 401, path);
  }
});

test("protected lessons preserve the workflow return path", async () => {
  const path = "/learn/data-analytics/module-1/what-is-data-analytics";
  const response = await render(path);
  assert.equal(response.status, 307);
  assert.match(response.headers.get("location") || "", /signin-with-chatgpt/);
  assert.match(response.headers.get("location") || "", /return_to/);
});
