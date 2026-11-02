import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard — Plumbcode",
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2
            size={24}
            className="animate-spin text-neutral-500"
            aria-label="Loading dashboard"
          />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  return (
    <DashboardShell userName={session.user.name} userEmail={session.user.email}>
      <Link href="/" aria-label="Plumbcode home" className="inline-flex">
        <Image
          src="/img/plumbcode-black.png"
          alt="Plumbcode"
          width={140}
          height={32}
          priority
          className="dark:hidden"
          style={{ height: 32, width: "auto" }}
          sizes="140px"
        />
        <Image
          src="/img/plumbcode-white.png"
          alt="Plumbcode"
          width={140}
          height={32}
          priority
          className="hidden dark:block"
          style={{ height: 32, width: "auto" }}
          sizes="140px"
        />
      </Link>

      <h1 className="mt-8 font-barabara text-3xl tracking-tight text-neutral-950 dark:text-white">
        Welcome back, {session.user.name}
      </h1>
      <p className="mt-2 font-sans text-sm text-neutral-600 dark:text-neutral-400">
        You&apos;re signed in as{" "}
        <span className="font-medium text-neutral-950 dark:text-white">
          {session.user.email}
        </span>
        .
      </p>
    </DashboardShell>
  );
}
