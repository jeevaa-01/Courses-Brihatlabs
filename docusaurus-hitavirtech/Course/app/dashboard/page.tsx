import type { Metadata } from "next";
import { DashboardPage } from "../../components/dashboard-page";
import { requireChatGPTUser } from "../chatgpt-auth";
export const metadata: Metadata = { title: "Learning Dashboard", description: "Track enrollment, lesson, assigned project, and completion progress across your courses." };
export const dynamic = "force-dynamic";
export default async function Page() { await requireChatGPTUser("/dashboard"); return <DashboardPage/>; }
