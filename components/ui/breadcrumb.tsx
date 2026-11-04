"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, LucideHome } from "lucide-react";

const formatSegment = (segment: string) => {
  return segment
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

type BreadcrumbsProps = {
  homeHref?: string;
  className?: string;
};

export default function Breadcrumbs({
  homeHref = "/dashboard",
  className = "",
}: BreadcrumbsProps) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    return { segment, href };
  });

  return (
    <div
      className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
    >
      <Button
        nativeButton={false}
        render={<Link href={homeHref} aria-label="Dashboard home" />}
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary/90"
      >
        <LucideHome size={18} />
      </Button>

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <React.Fragment key={crumb.href}>
            <ChevronRight
              size={14}
              className="shrink-0 text-muted-foreground/60"
            />

            {isLast ? (
              <span className="font-semibold tracking-tight text-foreground">
                {formatSegment(crumb.segment)}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="font-medium text-muted-foreground transition hover:text-foreground"
              >
                {formatSegment(crumb.segment)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
