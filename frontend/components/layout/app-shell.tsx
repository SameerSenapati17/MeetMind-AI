"use client";

import { motion } from "framer-motion";
import { useSidebar } from "./sidebar-context";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isExpanded } = useSidebar();

  return (
    <div className="app-shell">
      <Sidebar />
      <motion.div
        animate={{ marginLeft: isExpanded ? 240 : 72 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "flex-1 flex flex-col min-h-screen min-w-0",
          "md:ml-[240px]" // fallback for SSR — overridden by motion
        )}
        style={{ marginLeft: isExpanded ? 240 : 72 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
