import Link from "next/link";
import SignoutButton from "@/components/SignoutButton";

export const metadata = {
  title: "Log out — Plumbcode",
};

const card =
  "rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950 sm:p-6";
const eyebrow =
  "font-sans text-xs font-medium uppercase tracking-widest text-neutral-500";

export default function LogoutPage() {
  return (
    <section className={card}>
      <p className={eyebrow}>Session</p>
      <h2 className="mt-3 font-barabara text-xl tracking-tight text-neutral-950 dark:text-white">
        Log out of Plumbcode?
      </h2>
      <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        You&apos;ll need to sign in again to check repositories and manage
        principles.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SignoutButton label="Log out" />
        <Link
          href="/dashboard/settings/account"
          className="inline-flex items-center rounded-full px-4 py-2.5 font-sans text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-white dark:focus-visible:ring-white/30"
        >
          Cancel
        </Link>
      </div>
    </section>
  );
}
