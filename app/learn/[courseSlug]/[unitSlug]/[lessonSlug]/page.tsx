import type { Metadata } from "next";
import { LessonPage } from "../../../../../components/lesson-page";
import { CourseProjectLearningPage } from "../../../../../components/course-project-learning-page";
import { findLessonExact } from "../../../../../lib/course-data";
import { findCourseProject } from "../../../../../lib/course-projects";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../../../chatgpt-auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ courseSlug: string; unitSlug: string; lessonSlug: string }> }): Promise<Metadata> {
  const { courseSlug, unitSlug, lessonSlug } = await params;
  const project = unitSlug === "project" ? findCourseProject(lessonSlug) : null;
  const current = project ? null : findLessonExact(courseSlug, unitSlug, lessonSlug);
  if (!current && (!project || project.courseSlug !== courseSlug)) return { title: "Lesson not found | AgentLab" };
  if (project) return { title: `${project.title} — Project milestone | AgentLab`, description: project.summary };
  if (!current) return { title: "Lesson not found | AgentLab" };
  return { title: `${current.lesson.title} — ${current.course.title}`, description: current.lesson.description };
}

export default async function Page({ params }: { params: Promise<{ courseSlug: string; unitSlug: string; lessonSlug: string }> }) {
  const resolved = await params;
  return <ProtectedLesson params={resolved}/>;
}

async function ProtectedLesson({ params }: { params: { courseSlug: string; unitSlug: string; lessonSlug: string } }) {
  await requireChatGPTUser(`/learn/${params.courseSlug}/${params.unitSlug}/${params.lessonSlug}`);
  if (params.unitSlug === "project") {
    const project = findCourseProject(params.lessonSlug);
    if (!project || project.courseSlug !== params.courseSlug) notFound();
    return <CourseProjectLearningPage courseSlug={params.courseSlug} projectSlug={params.lessonSlug}/>;
  }
  if (!findLessonExact(params.courseSlug, params.unitSlug, params.lessonSlug)) notFound();
  return <LessonPage/>;
}
