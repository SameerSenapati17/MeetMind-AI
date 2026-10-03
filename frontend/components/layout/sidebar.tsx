"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  LayoutDashboard,
  ListVideo,
  Plus,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

const navSections = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Sessions", href: "/dashboard", icon: ListVideo, exact: true },
    ],
  },
  {
    title: "Create",
    items: [
      { label: "New Analysis", href: "/new", icon: Plus, exact: true },
    ],
  },
];

const bottomItems = [
  { label: "Settings", href: "#", icon: Settings, disabled: true },
  { label: "Help", href: "#", icon: HelpCircle, disabled: true },
];

function NavLink({
  item,
  isExpanded,
  isActive,
  disabled,
}: {
  item: NavItem & { disabled?: boolean };
  isExpanded: boolean;
  isActive: boolean;
  disabled?: boolean;
}) {
  const { closeMobile } = useSidebar();

  const inner = (
    <div
      className={cn(
        "sidebar-nav-item relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer select-none",
        isActive
          ? "bg-primary/10 text-primary font-medium active"
          : "text-sidebar-foreground hover:bg-white/5 hover:text-foreground",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      <item.icon
        className={cn(
          "flex-shrink-0 transition-colors",
          isExpanded ? "w-4 h-4" : "w-5 h-5",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      />
      <AnimatePresence>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Active indicator dot */}
      {isActive && !isExpanded && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </div>
  );

  if (disabled) return <div title={!isExpanded ? item.label : undefined}>{inner}</div>;

  return (
    <Link
      href={item.href}
      title={!isExpanded ? item.label : undefined}
      onClick={closeMobile}
    >
      {inner}
    </Link>
  );
}

function SidebarContent({ isExpanded }: { isExpanded: boolean }) {
  const pathname = usePathname();
  const { toggleExpanded, closeMobile } = useSidebar();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center h-14 px-3 border-b border-sidebar-border flex-shrink-0",
        isExpanded ? "justify-between" : "justify-center"
      )}>
        <Link href="/" onClick={closeMobile} className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-glow-sm">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <span className="text-sm font-bold text-foreground whitespace-nowrap">
                  MeetMind <span className="text-primary">AI</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={toggleExpanded}
          className={cn(
            "hidden md:flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex-shrink-0",
            !isExpanded && "mt-0"
          )}
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? (
            <ChevronLeft className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Mobile close button */}
        <button
          onClick={closeMobile}
          className="md:hidden flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {isExpanded && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
            {!isExpanded && (
              <div className="h-px bg-sidebar-border mx-2 mb-2" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.label}
                  item={item}
                  isExpanded={isExpanded}
                  isActive={isActive(item.href, item.exact)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="px-2 py-3 border-t border-sidebar-border space-y-0.5">
        {bottomItems.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            isExpanded={isExpanded}
            isActive={false}
            disabled={item.disabled}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isExpanded, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: isExpanded ? 240 : 72 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="app-sidebar hidden md:flex fixed top-0 left-0 h-full z-40"
        style={{ width: isExpanded ? 240 : 72 }}
      >
        <div className="w-full">
          <SidebarContent isExpanded={isExpanded} />
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sidebar-overlay md:hidden"
              onClick={closeMobile}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="app-sidebar md:hidden fixed top-0 left-0 h-full z-50"
              style={{ width: 240 }}
            >
              <div className="w-full">
                <SidebarContent isExpanded={true} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
