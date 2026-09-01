import assert from "node:assert/strict";
import test from "node:test";

const workerPromise = import(new URL("../dist/server/index.js", import.meta.url).href).then((module) => module.default);

async function get(path) {
  const worker = await workerPromise;
  return worker.fetch(new Request(`http://localhost${path}`, { redirect: "manual" }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("every published course exposes exactly two complete embedded projects", async () => {
  const catalogResponse = await get("/api/courses");
  assert.equal(catalogResponse.status, 200);
  assert.match(catalogResponse.headers.get("cache-control") || "", /s-maxage=300/);
  const catalog = await catalogResponse.json();
  assert.ok(catalog.courses.length > 0);
  for (const course of catalog.courses) {
    assert.equal(course.projectCount, 2, course.slug);
    const curriculumResponse = await get(`/api/courses/${course.id}/curriculum`);
    assert.equal(curriculumResponse.status, 200, course.slug);
    assert.match(curriculumResponse.headers.get("cache-control") || "", /stale-while-revalidate/);
    const curriculum = await curriculumResponse.json();
    assert.equal(curriculum.projects.length, 2, course.slug);
    assert.deepEqual(curriculum.projects.map((project) => project.position), [1, 2], course.slug);
    assert.ok(curriculum.projects[0].insertAfterModule <= curriculum.projects[1].insertAfterModule, `${course.slug}: project prerequisites must follow project order`);
    for (const project of curriculum.projects) {
      assert.equal(project.courseId, course.id, project.slug);
      assert.equal(project.courseSlug, course.slug, project.slug);
      assert.ok(project.insertAfterModule >= 1 && project.insertAfterModule <= curriculum.modules.length, project.slug);
      assert.ok(project.prerequisiteUnitIds.length, project.slug);
      assert.ok(project.assignment && project.businessContext, project.slug);
      assert.ok(project.milestones.length && project.functionalRequirements.length && project.nonFunctionalRequirements.length, project.slug);
      assert.ok(project.skills.length && project.technologies.length, project.slug);
    }
  }
});

test("data analytics projects render in numeric order and unlock in sequence", async () => {
  const response = await get("/api/courses/data-analytics/curriculum");
  assert.equal(response.status, 200);
  const curriculum = await response.json();
  assert.deepEqual(curriculum.projects.map((project) => project.title), ["Retail Sales Analysis", "Business Performance Dashboard"]);
  assert.deepEqual(curriculum.projects.map((project) => project.insertAfterModule), [6, 9]);
});

test("course details stay lightweight unless full content is requested", async () => {
  const summaryResponse = await get("/api/courses/data-analytics");
  assert.equal(summaryResponse.status, 200);
  const summary = await summaryResponse.json();
  assert.equal(summary.course.id, "data-analytics");
  assert.equal("units" in summary.course, false);
  assert.match(summaryResponse.headers.get("cache-control") || "", /s-maxage=300/);

  const contentResponse = await get("/api/courses/data-analytics?include=content");
  assert.equal(contentResponse.status, 200);
  const content = await contentResponse.json();
  assert.ok(Array.isArray(content.course.units));
});

test("every learner-facing lesson includes a daily-life analogy", async () => {
  const catalogResponse = await get("/api/courses");
  assert.equal(catalogResponse.status, 200);
  const catalog = await catalogResponse.json();
  for (const course of catalog.courses) {
    const contentResponse = await get(`/api/courses/${course.id}?include=content`);
    assert.equal(contentResponse.status, 200, course.slug);
    const content = await contentResponse.json();
    const lessons = content.course.units.flatMap((unit) => unit.lessons);
    for (const lesson of lessons.filter((item) => item.type !== "quiz")) {
      assert.ok(lesson.content.some((block) => block.type === "callout" && block.title === "Daily-life analogy"), `${course.slug}/${lesson.id}`);
    }
  }
});

test("project API exposes only course-assigned projects", async () => {
  const assigned = await get("/api/projects/retail-sales-analysis");
  assert.equal(assigned.status, 200);
  const unrelated = await get("/api/projects/ai-customer-support-intelligence");
  assert.equal(unrelated.status, 404);
});
