import InstallationsSection from "@/components/dashboard/InstallationsSection";
import { isInstallationErrorCode } from "@/lib/github-app";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata = {
  title: "Dashboard — Plumbcode",
};

type DashboardPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
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
  const firstName = session.user.name.split(" ")[0] || session.user.name;

  return (
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
  );
}
