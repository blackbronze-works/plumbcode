import type { ReactNode } from "react";
import SettingsNav from "@/components/settings/SettingsNav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      <h1 className="font-barabara text-3xl tracking-tight text-neutral-950 dark:text-white">
        Settings
      </h1>

      <div className="mt-8 flex flex-col gap-6 md:flex-row md:gap-10">
        <SettingsNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
