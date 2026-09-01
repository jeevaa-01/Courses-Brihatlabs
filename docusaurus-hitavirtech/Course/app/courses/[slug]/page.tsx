import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoursePage } from "../../../components/course-page";
import { findCourseExact } from "../../../lib/course-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = findCourseExact(slug);
  if (!course) return { title: "Course not found | AgentLab" };
  return { title: course.title, description: course.subtitle };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!findCourseExact(slug)) notFound();
  return <CoursePage slug={slug}/>;
}
