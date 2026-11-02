import type { ReactNode } from "react";
import Image from "next/image";
import Sidebar from "./Sidebar";

export default function DashboardShell({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      <Sidebar userName={userName} userEmail={userEmail} />

      <main className="relative z-10 min-w-0 flex-1 p-2">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 dark:border-white/10 dark:bg-neutral-950/80">
          {/* Decorative background: sand texture + corner logo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-5"
              style={{ backgroundImage: "url(/sand.jpg)" }}
            />
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

          {/* pt-16 on mobile keeps content clear of the hamburger button */}
          <div className="relative z-10 h-full overflow-y-auto overflow-x-hidden px-4 pb-10 pt-16 sm:px-6 md:px-10 md:pt-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
