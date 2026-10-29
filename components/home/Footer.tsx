import Image from "next/image";
import Link from "next/link";
import { GithubIcon } from "../GithubIcon";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Product", href: "/#product" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Security", href: "/security" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 px-4 py-16 dark:border-white/10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" aria-label="Plumbcode home" className="inline-block">
              <Image
                src="/img/plumbcode-black.png"
                alt="Plumbcode"
                width={140}
                height={32}
                className="h-9 w-auto dark:hidden"
              />
              <Image
                src="/img/plumbcode-white.png"
                alt="Plumbcode"
                width={140}
                height={32}
                className="hidden h-9 w-auto dark:block"
              />
            </Link>
            <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Every pull request, held to your standards.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-xs font-medium uppercase tracking-widest text-neutral-500">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-sans text-sm text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-neutral-200 pt-8 dark:border-white/10 sm:flex-row sm:items-center">
          <p className="font-sans text-xs text-neutral-500">
            &copy; 2026 Plumbcode. All rights reserved.
          </p>
          <Link
            href="https://github.com/mamebb2023"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Plumbcode on GitHub"
            className="text-neutral-500 transition-colors hover:text-neutral-950 dark:hover:text-white"
          >
            <GithubIcon size={18} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
