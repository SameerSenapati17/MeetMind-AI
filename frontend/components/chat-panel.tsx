"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Brain,
  User,
  Loader2,
  RefreshCcw,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SourceItem[];
  isError?: boolean;
}

interface SourceItem {
  text: string;
  start?: number;
  speaker?: string;
}

const SUGGESTIONS = [
  "What were the main decisions?",
  "What action items were assigned?",
  "What questions remain unresolved?",
  "Summarize the conversation.",
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ── Source card ───────────────────────────────────────────────────────────────
function SourceCard({ source, index }: { source: SourceItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="source-card bg-background/50 border border-border/50 rounded-lg p-3 text-xs hover:border-primary/30 transition-colors"
    >
      {source.start !== undefined && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            {formatTime(source.start)}
          </span>
          {source.speaker && (
            <span className="text-muted-foreground/70 font-medium">{source.speaker}</span>
          )}
        </div>
      )}
      <p className="text-muted-foreground italic leading-relaxed line-clamp-3">
        &ldquo;{source.text}&rdquo;
      </p>
    </motion.div>
  );
}

// ── Chat message ──────────────────────────────────────────────────────────────
function ChatMessage({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser
            ? "bg-primary text-white"
            : "bg-primary/15 text-primary border border-primary/20"
        )}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
      </div>

      <div
        className={cn(
          "flex flex-col max-w-[85%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Label */}
        <span className="text-[10px] font-medium text-muted-foreground/60 mb-1 px-1">
          {isUser ? "You" : "MeetMind"}
        </span>

        {/* Bubble */}
        <div
          className={cn(
            "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "chat-message-user text-white rounded-tr-sm"
              : message.isError
              ? "bg-red-500/8 text-red-400 border border-red-500/20 rounded-tl-sm"
              : "bg-card border border-border/60 text-foreground rounded-tl-sm"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 w-full space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-1 flex items-center gap-1">
              <BookOpen className="w-2.5 h-2.5" />
              Sources
            </p>
            {message.sources.map((s, i) => (
              <SourceCard key={i} source={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex gap-2.5"
    >
      <div className="w-7 h-7 rounded-full bg-primary/15 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
        <Brain className="w-3.5 h-3.5" />
      </div>
      <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">MeetMind is thinking...</span>
      </div>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function ChatEmptyState({
  onSuggestion,
}: {
  onSuggestion: (s: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full text-center px-4 py-8 gap-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <MessageSquare className="w-7 h-7 text-primary/60" />
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1 text-sm">Ask MeetMind</p>
        <p className="text-xs text-muted-foreground">
          Ask anything about this session. Every answer is grounded in the conversation.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="text-xs border border-border/60 bg-background/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all px-2.5 py-1.5 rounded-lg text-muted-foreground text-left"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main ChatPanel ─────────────────────────────────────────────────────────────
export default function ChatPanel({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get(`/api/sessions/${sessionId}/chat`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Failed to load chat history:", err));
  }, [sessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent, overrideInput?: string) => {
      e?.preventDefault();
      const msg = (overrideInput ?? input).trim();
      if (!msg || loading) return;

      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: msg }]);
      setLoading(true);

      try {
        const res = await api.post(`/api/sessions/${sessionId}/chat`, {
          message: msg,
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.data.answer,
            sources: res.data.sources,
          },
        ]);
      } catch (err: any) {
        const detail =
          err?.response?.data?.detail || "Something went wrong. Please try again.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: detail, isError: true },
        ]);
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [input, loading, sessionId]
  );

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      setInput(suggestion);
      inputRef.current?.focus();
    },
    []
  );

  return (
    <div className="flex flex-col h-full bg-card/30 border border-border/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card/60 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Ask MeetMind</h3>
            <p className="text-[10px] text-muted-foreground/60">AI copilot for this session</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            title="Clear conversation"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        <AnimatePresence>
          {messages.length === 0 && !loading ? (
            <ChatEmptyState onSuggestion={handleSuggestion} />
          ) : (
            <>
              {messages.map((m, i) => (
                <ChatMessage key={i} message={m} index={i} />
              ))}
              <AnimatePresence>
                {loading && <TypingIndicator />}
              </AnimatePresence>
            </>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/40 bg-card/60 backdrop-blur-sm flex-shrink-0">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-background/80 border border-border/60 rounded-xl pl-3.5 pr-1.5 py-1.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this session..."
            disabled={loading}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 text-foreground disabled:opacity-50 min-w-0"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="rounded-lg h-8 w-8 flex-shrink-0 shadow-none"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
