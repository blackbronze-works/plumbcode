import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/auth";
import SignoutButton from "@/components/SignoutButton";

export const metadata = {
  title: "Dashboard — Plumbcode",
};

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-24">
      <Suspense
        fallback={
          <Loader2
            size={24}
            className="animate-spin text-neutral-500"
            aria-label="Loading dashboard"
          />
        }
      >
        <DashboardContent />
      </Suspense>
    </main>
  );
}

async function DashboardContent() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  return (
    <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white/50 p-8 shadow-2xl shadow-neutral-900/10 dark:border-white/10 dark:bg-neutral-950/30 dark:shadow-black/60">
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

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <SignoutButton />
        <Link
          href="/"
          className="font-sans text-sm text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-950 hover:underline dark:text-neutral-400 dark:hover:text-white"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
