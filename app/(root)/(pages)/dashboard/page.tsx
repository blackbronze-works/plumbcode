import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { auth } from "@/lib/auth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import InstallationsSection from "@/components/dashboard/InstallationsSection";
import { isInstallationErrorCode } from "@/lib/github-app";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Dashboard — Plumbcode",
};

type DashboardPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          <Loader2
            size={24}
            className="animate-spin text-neutral-500"
            aria-label="Loading dashboard"
          />
        </div>
      }
    >
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const [installations, githubAccount, params] = await Promise.all([
    prisma.installation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        accountLogin: true,
        accountType: true,
      },
    }),
    prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "github",
      },
      select: { id: true },
    }),
    searchParams,
  ]);

  const rawError = Array.isArray(params.error) ? params.error[0] : params.error;

  const firstName = session.user.name.split(" ")[0] || session.user.name;

  return (
    <DashboardShell userName={session.user.name} userEmail={session.user.email}>
      <div className="max-w-4xl">
        <header>
          <h1 className="font-barabara text-3xl tracking-tight text-neutral-950 dark:text-white">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 font-sans text-sm text-neutral-600 dark:text-neutral-400">
            {installations.length > 0
              ? "Your GitHub account is connected."
              : "Connect GitHub to start checking pull requests."}
          </p>
        </header>

        <InstallationsSection
          installations={installations}
          hasGitHubAccount={Boolean(githubAccount)}
          errorCode={isInstallationErrorCode(rawError) ? rawError : null}
        />
      </div>
    </DashboardShell>
  );
}
