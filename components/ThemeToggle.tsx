import { Moon, Sun } from "lucide-react";

const ThemeToggle = ({ toggleTheme }: { toggleTheme: () => void }) => {
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-900/5 dark:text-neutral-300 dark:hover:bg-white/10"
    >
      <Moon size={18} className="dark:hidden" />
      <Sun size={18} className="hidden dark:block" />
    </button>
  );
};

export default ThemeToggle;
