import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import GithubComplete from "./Complete";

export const metadata = {
  title: "Connecting GitHub — Plumbcode",
};

type Props = {
  searchParams: Promise<{ error?: string | string[] }>;
};

async function CompleteContent({ searchParams }: Props) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return <GithubComplete error={error ?? null} />;
}

export default function GithubCompletePage({ searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-neutral-100 p-6 dark:bg-neutral-950">
          <Loader2
            size={18}
            className="animate-spin text-neutral-500"
            aria-label="Connecting to GitHub"
          />
        </div>
      }
    >
      <CompleteContent searchParams={searchParams} />
    </Suspense>
  );
}
