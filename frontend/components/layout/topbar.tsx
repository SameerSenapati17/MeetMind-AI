"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopbarProps {
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  showNewAnalysis?: boolean;
}

function useDefaultBreadcrumb(): BreadcrumbItem[] {
  const pathname = usePathname();
  
  if (pathname === "/dashboard") return [{ label: "Dashboard" }];
  if (pathname === "/new") return [{ label: "New Analysis" }];
  if (pathname.startsWith("/sessions/")) {
    return [
      { label: "Sessions", href: "/dashboard" },
      { label: "Session" },
    ];
  }
  return [];
}

export function Topbar({ breadcrumbs, actions, showNewAnalysis = true }: TopbarProps) {
  const { openMobile, isExpanded } = useSidebar();
  const defaultBreadcrumbs = useDefaultBreadcrumb();
  const crumbs = breadcrumbs || defaultBreadcrumbs;

  return (
    <header className="app-topbar">
      {/* Mobile hamburger */}
      <button
        onClick={openMobile}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={cn(
                "truncate",
                i === crumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        {showNewAnalysis && (
          <Button size="sm" asChild className="gap-1.5 text-xs">
            <Link href="/new">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Analysis</span>
              <span className="sm:hidden">New</span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
