"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Sparkles,
  CheckSquare,
  ListTodo,
  HelpCircle,
  FileText,
  MessageSquare,
  Play,
  UploadCloud,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Animated product preview ──────────────────────────────────────────────────
const previewSummary = [
  "The team aligned on moving to a microservices architecture for the new platform.",
  "Frontend performance targets were set at sub-2s load time for all critical paths.",
];

const previewActionItems = [
  { task: "Set up CI/CD pipeline for new services", owner: "Dev Team" },
  { task: "Define API contracts for auth service", owner: "Backend" },
  { task: "Create performance monitoring dashboard", owner: "Infra" },
];

const previewDecisions = [
  "Adopt microservices architecture for v2",
  "Use PostgreSQL as primary database",
];

function PreviewBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
      {children}
    </span>
  );
}

function ProductPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="relative w-full max-w-5xl mx-auto"
    >
      {/* Fade overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/70 to-transparent z-10 rounded-b-2xl pointer-events-none" />

      {/* Outer frame */}
      <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-surface-lg overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-card/80">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-background/80 border border-border/40 rounded-md px-4 py-0.5 text-xs text-muted-foreground/60 font-mono">
              meetmind.ai/sessions/rag-overview
            </div>
          </div>
        </div>

        {/* App shell preview */}
        <div className="flex h-[360px] overflow-hidden">
          {/* Mini sidebar */}
          <div className="w-40 border-r border-border/40 bg-sidebar flex flex-col flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-3 border-b border-sidebar-border">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                <Brain className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold text-foreground/80">MeetMind AI</span>
            </div>
            <div className="px-2 py-3 space-y-0.5">
              {[
                { label: "Dashboard", active: false },
                { label: "Sessions", active: false },
                { label: "New Analysis", active: false, accent: true },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`px-2 py-1.5 rounded text-[10px] font-medium ${
                    item.accent
                      ? "text-primary bg-primary/10"
                      : item.active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Session header */}
            <div className="px-4 py-2.5 border-b border-border/40 bg-card/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-foreground truncate">RAG Architecture Overview</span>
                  <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-medium">Completed</span>
                </div>
                <span className="text-[10px] text-muted-foreground/60">Oct 2, 2026 · YouTube</span>
              </div>
              <div className="flex gap-1.5">
                <div className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded-md font-medium">
                  Ask MeetMind
                </div>
                <div className="text-[9px] bg-muted border border-border/50 text-muted-foreground px-2 py-1 rounded-md font-medium">
                  Export
                </div>
              </div>
            </div>

            {/* Content grid */}
            <div className="flex flex-1 overflow-hidden">
              {/* Main panel */}
              <div className="flex-1 p-3 overflow-hidden space-y-2.5 min-w-0">
                {/* Summary */}
                <div className="bg-primary/5 border border-primary/15 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-semibold text-primary">AI Summary</span>
                  </div>
                  {previewSummary.map((line, i) => (
                    <p key={i} className="text-[9px] text-foreground/70 leading-relaxed mb-0.5">{line}</p>
                  ))}
                </div>

                {/* Insight cards */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Action Items", count: 3, color: "text-green-400" },
                    { label: "Decisions", count: 2, color: "text-blue-400" },
                    { label: "Questions", count: 1, color: "text-yellow-400" },
                  ].map((item) => (
                    <div key={item.label} className="bg-card/60 border border-border/40 rounded-lg p-2">
                      <p className={`text-[8px] font-medium ${item.color} mb-0.5`}>{item.label}</p>
                      <p className="text-lg font-bold text-foreground">{item.count}</p>
                    </div>
                  ))}
                </div>

                {/* Action items list */}
                <div className="space-y-1">
                  {previewActionItems.slice(0, 2).map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5 p-1.5 bg-background/40 border border-border/30 rounded-md">
                      <div className="w-3 h-3 rounded-full border border-green-500/50 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] text-foreground/80 leading-tight">{item.task}</p>
                        <p className="text-[8px] text-muted-foreground/60">{item.owner}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat panel */}
              <div className="w-40 border-l border-border/40 bg-card/30 flex flex-col flex-shrink-0">
                <div className="px-2.5 py-2 border-b border-border/40 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-semibold text-foreground/80">Ask MeetMind</span>
                </div>
                <div className="flex-1 p-2 space-y-1.5 overflow-hidden">
                  <div className="flex gap-1 items-start">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-2 h-2 text-primary" />
                    </div>
                    <div className="bg-muted/60 rounded-md px-1.5 py-1 text-[8px] text-foreground/70 max-w-[90px]">
                      How can I help with this session?
                    </div>
                  </div>
                  <div className="flex gap-1 items-start flex-row-reverse">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-[6px] text-white font-bold">U</span>
                    </div>
                    <div className="bg-primary/20 rounded-md px-1.5 py-1 text-[8px] text-foreground/80 max-w-[90px]">
                      What were the main decisions?
                    </div>
                  </div>
                  <div className="flex gap-1 items-start">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-2 h-2 text-primary" />
                    </div>
                    <div className="bg-muted/60 rounded-md px-1.5 py-1 text-[8px] text-foreground/70 max-w-[90px]">
                      The team decided to adopt microservices and PostgreSQL...
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t border-border/40">
                  <div className="flex items-center gap-1 bg-background/60 border border-border/40 rounded-md px-1.5 py-1">
                    <span className="text-[8px] text-muted-foreground/50 flex-1">Ask anything...</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="w-2 h-2 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Feature pills ─────────────────────────────────────────────────────────────
const features = [
  { icon: FileText, label: "AI Transcript" },
  { icon: ListTodo, label: "Action Items" },
  { icon: CheckSquare, label: "Key Decisions" },
  { icon: HelpCircle, label: "Open Questions" },
  { icon: MessageSquare, label: "AI Copilot" },
];

// ── Landing page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-glow-sm">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">
              MeetMind <span className="text-primary">AI</span>
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Workspace
              </Link>
            </Button>
            <Button size="sm" asChild className="gap-1.5">
              <Link href="/new">
                <Plus className="w-3.5 h-3.5" />
                New Analysis
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative pt-20 pb-16 px-4 md:px-8 text-center overflow-hidden">
          {/* Ambient gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute top-32 left-1/4 w-[300px] h-[200px] bg-blue-500/4 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 border border-primary/25 bg-primary/8 rounded-full px-4 py-1.5 text-sm font-medium text-primary mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-powered conversation intelligence</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"
            >
              Turn every conversation
              <br className="hidden md:block" />
              <span className="gradient-text"> into actionable intelligence.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Upload a meeting video or paste a YouTube URL. MeetMind transcribes,
              extracts decisions, surfaces action items, and lets you ask AI anything
              about the conversation.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Button size="lg" asChild className="gap-2 text-base h-12 px-7 shadow-glow-sm">
                <Link href="/new">
                  <Plus className="w-4 h-4" />
                  New Analysis
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 text-base h-12 px-7">
                <Link href="/dashboard">
                  Open Workspace
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              className="flex flex-wrap items-center justify-center gap-2.5 mt-10"
            >
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 bg-card/60 border border-border/50 rounded-full px-3.5 py-1.5 text-sm text-muted-foreground"
                >
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Product preview */}
        <section className="px-4 md:px-8 pb-20">
          <ProductPreview />
        </section>

        {/* How it works */}
        <section className="px-4 md:px-8 py-20 border-t border-border/40">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                From conversation to clarity in minutes
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                MeetMind processes your media end-to-end — no manual setup required.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: UploadCloud,
                  title: "Upload or link",
                  desc: "Drop a video file or paste a YouTube URL. Supports MP4, MOV, MP3, WAV and more.",
                },
                {
                  step: "02",
                  icon: Brain,
                  title: "AI analyzes",
                  desc: "MeetMind transcribes with Whisper, then extracts insights with advanced AI models.",
                },
                {
                  step: "03",
                  icon: MessageSquare,
                  title: "Ask anything",
                  desc: "Chat with your session using RAG-powered Q&A. Every answer is grounded in your conversation.",
                },
              ].map(({ step, icon: Icon, title, desc }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative bg-card/40 border border-border/50 rounded-2xl p-6 hover:border-border/80 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-primary/60 mb-1">{step}</div>
                      <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/70 flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span>MeetMind AI</span>
          </div>
          <span>Turn conversations into intelligence.</span>
        </div>
      </footer>
    </div>
  );
}


