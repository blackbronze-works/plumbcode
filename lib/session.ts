import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Per-request session lookup. React's cache means the dashboard layout and
 * any page beneath it share a single Better Auth lookup.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireSession() {
  const session = await getSession();

  if (!session) redirect("/login");

  return session;
}
