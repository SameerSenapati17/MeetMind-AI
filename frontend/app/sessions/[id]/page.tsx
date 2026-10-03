"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  CheckSquare,
  Lightbulb,
  HelpCircle,
  Clock,
  Video,
  ListTodo,
  Play,
  Search,
  Brain,
  Loader2,
} from "lucide-react";
import api, { API_URL } from "@/lib/api";
import { Session } from "@/types/session";
import ProcessingStatus from "@/components/processing-status";
import ChatPanel from "@/components/chat-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

// ── Data normalisation ─────────────────────────────────────────────────────────
function parseList(raw: string | null): any[] {
  if (!raw || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [String(parsed)];
  } catch {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.length > 0 ? lines : [raw];
  }
}

function parseSummary(raw: string | null): string[] {
  if (!raw || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    if (typeof parsed === "string") {
      return parsed.split("\n").map((l) => l.trim()).filter(Boolean);
    }
  } catch {}
  return raw.split("\n").map((l) => l.trim()).filter(Boolean);
}

function itemToText(item: any): string {
  if (typeof item === "string") return item;
  if (typeof item === "object" && item !== null) {
    return (
      item.task ||
      item.text ||
      item.content ||
      item.description ||
      item.decision ||
      item.question ||
      item.item ||
      (Object.values(item).find((v) => typeof v === "string") as string) ||
      JSON.stringify(item)
    );
  }
  return String(item);
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ── Tab types ─────────────────────────────────────────────────────────────────
type Tab = "overview" | "insights" | "transcript";

// ── Overview tab ──────────────────────────────────────────────────────────────
function SummaryBlock({ lines }: { lines: string[] }) {
  if (lines.length === 0) {
    return <p className="text-muted-foreground text-sm">No summary available.</p>;
  }
  if (lines.length === 1) {
    return (
      <p className="text-foreground/90 leading-relaxed text-[15px]">{lines[0]}</p>
    );
  }
  return (
    <ul className="space-y-2.5">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-foreground/90">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
          <span>{line.replace(/^[-*•]\s*/, "")}</span>
        </li>
      ))}
    </ul>
  );
}

function ActionItemRow({ item }: { item: any }) {
  const isObj = typeof item === "object" && item !== null;
  const task = isObj ? item.task || itemToText(item) : String(item);
  const owner = isObj ? item.owner || null : null;
  const deadline = isObj ? item.deadline || null : null;

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-background/60 border border-border/40 hover:border-border/70 transition-colors">
      <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-green-500/40 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] leading-relaxed text-foreground/90">
          {task.replace(/^[-*•]\s*/, "")}
        </p>
        {(owner || deadline) && (
          <div className="flex flex-wrap gap-3 mt-1.5">
            {owner && owner !== "Not specified" && (
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/60">Owner:</span> {owner}
              </span>
            )}
            {deadline && deadline !== "Not specified" && (
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/60">Deadline:</span> {deadline}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BulletRow({ item, color }: { item: any; color: "blue" | "yellow" }) {
  const text = itemToText(item).replace(/^[-*•\d.]+\s*/, "");
  const dotClass = color === "blue" ? "bg-blue-400" : "bg-yellow-400";

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-background/60 border border-border/40 hover:border-border/70 transition-colors">
      <div className={`w-1.5 h-1.5 rounded-full ${dotClass} flex-shrink-0 mt-2.5`} />
      <span className="text-[15px] leading-relaxed text-foreground/90">{text}</span>
    </div>
  );
}

function InsightSection({
  icon: Icon,
  title,
  count,
  iconColor,
  emptyText,
  children,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  iconColor: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card/50 border border-border/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        {count > 0 && (
          <span className="text-sm font-medium text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {count === 0 ? (
        <p className="text-sm text-muted-foreground py-2">{emptyText}</p>
      ) : (
        <div className="space-y-2.5">{children}</div>
      )}
    </div>
  );
}

// ── Transcript tab ────────────────────────────────────────────────────────────
function TranscriptViewer({ segments }: { segments: any[] }) {
  const [search, setSearch] = useState("");
  const matchedRef = useRef<HTMLDivElement>(null);

  const filtered = search
    ? segments.filter((t) =>
        t.text?.toLowerCase().includes(search.toLowerCase())
      )
    : segments;

  useEffect(() => {
    if (search && matchedRef.current) {
      matchedRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [search]);

  function highlightText(text: string, query: string): React.ReactNode {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/25 text-primary rounded px-0.5">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  return (
    <div className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden">
      {/* Search bar */}
      <div className="px-5 py-3 border-b border-border/40 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background/60 border border-border/50 rounded-lg text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 text-foreground"
          />
        </div>
        {search && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {filtered.length} match{filtered.length !== 1 ? "es" : ""}
          </span>
        )}
      </div>

      {/* Segments */}
      <div className="max-h-[600px] overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {search ? "No matches found." : "No transcript available."}
          </p>
        ) : (
          <div className="relative transcript-timeline space-y-5">
            {filtered.map((t: any, i: number) => (
              <div
                key={i}
                ref={i === 0 && search ? matchedRef : undefined}
                className="flex gap-4 group pl-6"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 mt-1 w-5 h-5 rounded-full bg-background border-2 border-border/50 group-hover:border-primary/50 transition-colors flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                </div>

                {/* Timestamp */}
                {t.start !== undefined && (
                  <span className="text-xs font-mono bg-muted/60 text-primary/80 px-2 py-1 rounded-md flex-shrink-0 h-fit leading-tight">
                    {formatTime(t.start)}
                  </span>
                )}

                {/* Text */}
                <div className="flex-1 min-w-0">
                  {t.speaker && (
                    <span className="text-xs font-semibold text-muted-foreground mr-2">
                      {t.speaker}:
                    </span>
                  )}
                  <span className="text-[15px] leading-relaxed text-foreground/90">
                    {highlightText(t.text, search)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({
  summaryLines,
  actionItems,
  decisions,
  openQuestions,
}: {
  summaryLines: string[];
  actionItems: any[];
  decisions: any[];
  openQuestions: any[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Summary */}
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="font-semibold text-primary text-sm">AI Summary</h3>
        </div>
        <SummaryBlock lines={summaryLines} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Action Items", count: actionItems.length, icon: ListTodo, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Decisions", count: decisions.length, icon: CheckSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Questions", count: openQuestions.length, icon: HelpCircle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <div key={label} className={cn("rounded-2xl p-4 border border-border/40", "bg-card/50")}>
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mb-2.5", bg)}>
              <Icon className={cn("w-3.5 h-3.5", color)} />
            </div>
            <p className="text-2xl font-bold text-foreground mb-0.5">{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Insights tab ──────────────────────────────────────────────────────────────
function InsightsTab({
  actionItems,
  decisions,
  openQuestions,
}: {
  actionItems: any[];
  decisions: any[];
  openQuestions: any[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <InsightSection
        icon={ListTodo}
        title="Action Items"
        count={actionItems.length}
        iconColor="bg-green-500/10 text-green-400"
        emptyText="No action items were identified."
      >
        {actionItems.map((item, i) => (
          <ActionItemRow key={i} item={item} />
        ))}
      </InsightSection>

      <InsightSection
        icon={Lightbulb}
        title="Key Decisions"
        count={decisions.length}
        iconColor="bg-blue-500/10 text-blue-400"
        emptyText="No key decisions were identified."
      >
        {decisions.map((item, i) => (
          <BulletRow key={i} item={item} color="blue" />
        ))}
      </InsightSection>

      <InsightSection
        icon={HelpCircle}
        title="Open Questions"
        count={openQuestions.length}
        iconColor="bg-yellow-500/10 text-yellow-400"
        emptyText="No unresolved questions were identified."
      >
        {openQuestions.map((item, i) => (
          <BulletRow key={i} item={item} color="yellow" />
        ))}
      </InsightSection>
    </motion.div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: Tab;
  onChange: (t: Tab) => void;
}) {
  const tabs: { value: Tab; label: string; icon: React.ElementType }[] = [
    { value: "overview", label: "Overview", icon: Brain },
    { value: "insights", label: "Insights", icon: ListTodo },
    { value: "transcript", label: "Transcript", icon: FileText },
  ];

  return (
    <div className="flex gap-1 bg-muted/40 border border-border/40 rounded-xl p-1">
      {tabs.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            "relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
            activeTab === value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/80"
          )}
        >
          {activeTab === value && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 bg-card border border-border/50 rounded-lg shadow-surface"
            />
          )}
          <Icon className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10 hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SessionSkeleton() {
  return (
    <AppShell>
      <Topbar breadcrumbs={[{ label: "Sessions", href: "/dashboard" }, { label: "Loading..." }]} />
      <div className="page-container">
        <div className="mb-6 space-y-2">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-1/2 h-8" />
          <Skeleton className="w-48 h-4" />
        </div>
        <div className="session-workspace">
          <div className="space-y-5">
            <Skeleton className="w-full h-10 rounded-xl" />
            <Skeleton className="w-full h-40 rounded-2xl" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          </div>
          <Skeleton className="w-full h-[500px] rounded-2xl" />
        </div>
      </div>
    </AppShell>
  );
}

// ── Session page ──────────────────────────────────────────────────────────────
export default function SessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [exporting, setExporting] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await api.get(`/api/sessions/${params.id}`);
      setSession(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!session) return;
    try {
      setExporting(true);
      const actualUrl = `${API_URL}/api/sessions/${session.id}/export/pdf`;
      
      const res = await api.get(actualUrl, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${session.title || "Session"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [params.id]);

  if (loading) return <SessionSkeleton />;

  if (!session) {
    return (
      <AppShell>
        <Topbar breadcrumbs={[{ label: "Sessions", href: "/dashboard" }, { label: "Not Found" }]} />
        <div className="page-container flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Session Not Found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This session does not exist or was deleted.
          </p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  if (session.status !== "completed" && session.status !== "failed") {
    return (
      <AppShell>
        <Topbar
          breadcrumbs={[
            { label: "Sessions", href: "/dashboard" },
            { label: session.title || "Processing..." },
          ]}
        />
        <div className="page-container flex items-center justify-center min-h-[500px]">
          <ProcessingStatus sessionId={session.id} onComplete={fetchSession} />
        </div>
      </AppShell>
    );
  }

  const summaryLines = parseSummary(session.summary);
  const actionItems = parseList(session.action_items);
  const decisions = parseList(session.decisions);
  const openQuestions = parseList(session.open_questions);
  const transcript = session.transcript;

  const isYoutube = session.source_type === "youtube";

  return (
    <AppShell>
      <Topbar
        breadcrumbs={[
          { label: "Sessions", href: "/dashboard" },
          { label: session.title || "Untitled Session" },
        ]}
        showNewAnalysis={false}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={exporting}
            className="gap-1.5 text-xs min-w-[100px]"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {exporting ? "Exporting..." : "Export PDF"}
          </Button>
        }
      />

      <div className="page-container">
        {/* Session header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-xl font-bold text-foreground">
              {session.title || "Untitled Session"}
            </h1>
            {session.status === "completed" ? (
              <Badge variant="success">Completed</Badge>
            ) : (
              <Badge variant="destructive">Failed</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {isYoutube ? (
              <span className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" /> YouTube
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Upload
              </span>
            )}
            {session.created_at && (
              <>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(session.created_at), "PPP")}
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Workspace grid */}
        <div className="session-workspace">
          {/* Main panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="space-y-4 min-w-0"
          >
            <TabBar activeTab={activeTab} onChange={setActiveTab} />

            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <OverviewTab
                    summaryLines={summaryLines}
                    actionItems={actionItems}
                    decisions={decisions}
                    openQuestions={openQuestions}
                  />
                </motion.div>
              )}
              {activeTab === "insights" && (
                <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <InsightsTab
                    actionItems={actionItems}
                    decisions={decisions}
                    openQuestions={openQuestions}
                  />
                </motion.div>
              )}
              {activeTab === "transcript" && (
                <motion.div key="transcript" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  {transcript && transcript.length > 0 ? (
                    <TranscriptViewer segments={transcript} />
                  ) : (
                    <div className="bg-card/50 border border-border/50 rounded-2xl p-8 text-center">
                      <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No transcript available.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Chat panel */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="h-[calc(100vh-160px)] min-h-[480px] sticky top-16"
          >
            <ChatPanel sessionId={session.id} />
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
