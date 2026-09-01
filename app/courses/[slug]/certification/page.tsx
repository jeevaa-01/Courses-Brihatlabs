import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { findCourseExact } from "@/lib/course-data";
import { CertificationPage } from "@/components/certification/certification-page";

export default async function CourseCertificationRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = findCourseExact(slug);
  if (!course) return <main className="section-shell"><h1>Course not found</h1></main>;
  const user = await requireChatGPTUser(`/courses/${course.slug}/certification`);
  return <CertificationPage courseId={course.id} courseSlug={course.slug} courseTitle={course.title} suggestedName={user.fullName || user.displayName} />;
}
