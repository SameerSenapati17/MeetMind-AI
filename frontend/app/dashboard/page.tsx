"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import {
  Search,
  Play,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  LayoutGrid,
  ListVideo,
  ArrowRight,
  Inbox,
  Loader2,
  Filter,
} from "lucide-react";
import api from "@/lib/api";
import { Session } from "@/types/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

// ── Status helpers ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="w-3 h-3 animate-pulse" /> Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" /> Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" /> Queued
        </Badge>
      );
  }
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Stats card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent?: string;
  loading: boolean;
}) {
  return (
    <div className="bg-card/60 border border-border/50 rounded-2xl p-5 hover:border-border/80 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          {label}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            accent ? accent : "bg-muted/60 text-muted-foreground"
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-9 w-12" />
      ) : (
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
      )}
    </div>
  );
}

// ── Session card ──────────────────────────────────────────────────────────────
function SessionCard({ session, index }: { session: Session; index: number }) {
  const isYoutube = session.source_type === "youtube";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/sessions/${session.id}`}>
        <div className="group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card/50 hover:bg-card/80 hover:border-border/80 hover:shadow-surface transition-all duration-200 cursor-pointer">
          {/* Source icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
              session.status === "completed"
                ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isYoutube ? (
              <Play className="w-4 h-4 ml-0.5" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-semibold text-foreground/90 group-hover:text-foreground transition-colors truncate text-sm">
                {session.title || "Untitled Session"}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusBadge status={session.status} />
              <span className="text-xs text-muted-foreground">
                {isYoutube ? "YouTube" : "Upload"}
              </span>
              {session.created_at && (
                <>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-all duration-200 flex-shrink-0 group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyWorkspace({ hasSearch }: { hasSearch: boolean }) {
  if (hasSearch) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
          <Search className="w-7 h-7 text-muted-foreground/50" />
        </div>
        <h3 className="font-semibold text-foreground mb-1.5">No sessions found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          No conversations match your search. Try different keywords.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {/* Icon composition */}
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-2xl bg-muted/30 flex items-center justify-center">
          <Inbox className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <div className="absolute -right-2 -top-2 w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Your workspace is empty</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        Start with your first conversation and MeetMind will turn it into a
        searchable knowledge workspace.
      </p>
      <Button asChild className="gap-2 shadow-glow-sm">
        <Link href="/new">
          <Plus className="w-4 h-4" />
          New Analysis
        </Link>
      </Button>
    </motion.div>
  );
}

// ── Loading skeletons ─────────────────────────────────────────────────────────
function SessionSkeletons() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-card/40">
          <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/sessions")
      .then((res) => {
        const sorted = res.data.sort(
          (a: any, b: any) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setSessions(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = sessions.filter((s) => {
    const matchesSearch =
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.id.includes(search);
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completed = sessions.filter((s) => s.status === "completed").length;
  const processing = sessions.filter((s) => s.status === "processing").length;

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "completed", label: "Completed" },
    { value: "processing", label: "Processing" },
    { value: "failed", label: "Failed" },
  ];

  return (
    <AppShell>
      <Topbar breadcrumbs={[{ label: "Dashboard" }]} />

      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8"
        >
          <div>
            <p className="text-sm text-muted-foreground mb-1">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-foreground">
              Your conversation intelligence workspace.
            </h1>
          </div>
          <Button asChild className="gap-2 flex-shrink-0 shadow-glow-sm">
            <Link href="/new">
              <Plus className="w-4 h-4" />
              New Analysis
            </Link>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
        >
          <StatCard
            label="Total Sessions"
            value={sessions.length}
            icon={LayoutGrid}
            accent="bg-primary/10 text-primary"
            loading={loading}
          />
          <StatCard
            label="Completed"
            value={completed}
            icon={CheckCircle2}
            accent="bg-green-500/10 text-green-400"
            loading={loading}
          />
          <StatCard
            label="Processing"
            value={processing}
            icon={Clock}
            accent="bg-yellow-500/10 text-yellow-400"
            loading={loading}
          />
        </motion.div>

        {/* Sessions section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Sessions</h2>

            {/* Search + filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-card/60 border border-border/50 rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all w-[180px] md:w-[220px] text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 bg-card/60 border border-border/50 rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground cursor-pointer"
                >
                  {statusFilters.map((f) => (
                    <option key={f.value} value={f.value} className="bg-card">
                      {f.label}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Session list */}
          {loading ? (
            <SessionSkeletons />
          ) : filtered.length > 0 ? (
            <div className="space-y-2.5">
              {filtered.map((s, i) => (
                <SessionCard key={s.id} session={s} index={i} />
              ))}
            </div>
          ) : (
            <EmptyWorkspace hasSearch={!!search || statusFilter !== "all"} />
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
