import type { Metadata } from "next";
import { CoursesPage } from "../../components/home";
export const metadata: Metadata = { title: "Courses | AgentLab", description: "Choose a course sequence and build practical software, data, AI, and quality skills through lessons, projects, and assessments." };
export default function Page() { return <CoursesPage />; }
