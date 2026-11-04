import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2
        size={24}
        className="animate-spin text-neutral-500"
        aria-label="Loading dashboard"
      />
    </div>
  );
}
