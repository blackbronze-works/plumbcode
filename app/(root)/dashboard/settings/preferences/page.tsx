import ThemeSelector from "@/components/settings/ThemeSelector";

export const metadata = {
  title: "Preferences — Plumbcode",
};

const eyebrow =
  "font-sans text-xs font-medium uppercase tracking-widest text-neutral-500";

export default function PreferencesPage() {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950 sm:p-6">
      <h2 className={eyebrow}>Appearance</h2>
      <p className="mt-3 font-sans text-sm text-neutral-600 dark:text-neutral-400">
        Choose how Plumbcode looks. System follows your device setting.
      </p>
      <div className="mt-5">
        <ThemeSelector />
      </div>
    </section>
  );
}
