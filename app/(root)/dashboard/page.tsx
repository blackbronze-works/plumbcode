import { Suspense } from "react";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import InstallationsSection from "@/components/dashboard/InstallationsSection";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { getDashboardData } from "@/lib/dashboard-data";
import { isInstallationErrorCode } from "@/lib/github-app";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata = {
  title: "Dashboard — Plumbcode",
};

type DashboardPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <div className="w-full">
      {/* The session and installation data stream in behind a skeleton so
          navigations between dashboard pages stay instant. */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
  // The layout enforces auth. Calling the cached helper here only gives this
  // page the user id without a second Better Auth lookup.
  const session = await requireSession();

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
  const errorCode = isInstallationErrorCode(rawError) ? rawError : null;
  const firstName = session.user.name.split(" ")[0] || session.user.name;

  const overview =
    installations.length > 0
      ? await getDashboardData(
          installations.map((installation) => installation.id),
        )
      : null;

  let subtitle = "Connect GitHub to start checking pull requests.";
  if (installations.length > 0) {
    subtitle = overview?.hasAnyReview
      ? "Here's what Plumbcode has checked on your repositories."
      : "Plumbcode is ready to check your first pull request.";
  }

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-barabara text-3xl tracking-tight text-neutral-950 dark:text-white">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 font-sans text-sm text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
        </div>

      </header>

      {(installations.length === 0 || errorCode) && (
        <InstallationsSection
          installations={installations}
          hasGitHubAccount={Boolean(githubAccount)}
          errorCode={errorCode}
        />
      )}

      {overview && <DashboardOverview data={overview} />}
    </>
  );
}
