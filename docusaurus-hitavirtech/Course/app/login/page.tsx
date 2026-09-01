import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthPage } from "../../components/auth-page";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ returnTo?: string; error?: string }> }) {
  const query = await searchParams;
  const returnTo = query.returnTo?.startsWith("/") && !query.returnTo.startsWith("//") ? query.returnTo : "/dashboard";
  const user = await getChatGPTUser();
  if (user) redirect(returnTo);
  return <AuthPage signInHref={chatGPTSignInPath(returnTo)} error={Boolean(query.error)}/>;
}
