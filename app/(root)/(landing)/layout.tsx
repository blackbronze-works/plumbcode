import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LandingClientLayout from "./LandingClientLayout";

// This group only resolves the session to redirect signed-in visitors. It has
// no content to stream behind a skeleton, so allow the navigation to block
// rather than flashing a placeholder that is immediately replaced.
export const instant = false;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return <LandingClientLayout>{children}</LandingClientLayout>;
}
