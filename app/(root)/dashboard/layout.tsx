import type { ReactNode } from "react";
import Image from "next/image";
import Breadcrumbs from "@/components/ui/breadcrumb";
import Sidebar from "@/components/dashboard/Sidebar";
import { requireSession } from "@/lib/session";

// The whole segment is auth-gated: the session (a cookies() read) must resolve
// before any dashboard UI renders, so this route intentionally blocks on the
// server instead of streaming a shell. See the Cache Components auth guide:
// https://nextjs.org/docs/app/guides/authentication-with-cache-components
export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex h-dvh w-full overflow-hidden dark:bg-neutral-900">
      <Sidebar userName={session.user.name} userEmail={session.user.email} />

      <main className="relative z-10 min-w-0 flex-1 p-2 pl-2 md:pl-0">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 text-neutral-950 dark:border-white/10 dark:bg-neutral-950/80 dark:text-white">
          {/* Decorative background: sand texture + corner logo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/sand-white.jpg')] bg-cover bg-center opacity-10 dark:bg-[url('/sand.jpg')] dark:opacity-5" />
            <Image
              src="/img/plumbcode-black.png"
              alt=""
              width={400}
              height={92}
              className="absolute -bottom-30 -right-30 opacity-5 dark:hidden"
              style={{ width: "auto", height: "auto" }}
            />
            <Image
              src="/img/plumbcode-white.png"
              alt=""
              width={400}
              height={92}
              className="absolute -bottom-30 -right-30 hidden opacity-5 dark:block"
              style={{ width: "auto", height: "auto" }}
            />
          </div>

          {/* Consistent gutter at every breakpoint; the extra mobile start
              padding on the breadcrumb clears the floating menu button. */}
          <div className="relative z-10 h-full overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
            <Breadcrumbs className="mb-6 pl-11 sm:pl-0" />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
