"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Youtube,
  Languages,
  FileVideo,
  FileAudio,
  X,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";

type Mode = "upload" | "youtube";

const ACCEPTED = ".mp4,.mov,.mkv,.avi,.webm,.mp3,.wav,.m4a";
const ACCEPTED_LABEL = "MP4 · MOV · MKV · MP3 · WAV · M4A";
const MAX_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["mp4", "mov", "mkv", "avi", "webm"].includes(ext || "")) return FileVideo;
  return FileAudio;
}

function isValidYoutubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
}

// ── Mode selector ─────────────────────────────────────────────────────────────
function ModeCard({
  mode,
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  mode: Mode;
  active: boolean;
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "relative flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer",
        active
          ? "border-primary bg-primary/8 shadow-glow"
          : "border-border/50 bg-card/40 hover:border-border hover:bg-card/60"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
          active ? "bg-primary text-white shadow-glow-sm" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-center">
        <p className={cn("font-semibold mb-0.5", active ? "text-primary" : "text-foreground")}>
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {active && (
        <motion.div
          layoutId="mode-indicator"
          className="absolute inset-0 rounded-2xl ring-2 ring-primary/30 pointer-events-none"
        />
      )}
    </motion.button>
  );
}

// ── Upload zone ───────────────────────────────────────────────────────────────
function UploadZone({
  file,
  dragActive,
  onFile,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
}: {
  file: File | null;
  dragActive: boolean;
  onFile: (f: File) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onRemove: () => void;
}) {
  const FileIcon = file ? getFileIcon(file.name) : UploadCloud;

  return (
    <AnimatePresence mode="wait">
      {file ? (
        <motion.div
          key="file-selected"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-4 p-5 rounded-2xl border-2 border-primary/30 bg-primary/5"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <FileIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{file.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium uppercase">
                {file.name.split(".").pop()}
              </span>
              <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                Ready
              </span>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="drop-zone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept={ACCEPTED}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
          <label
            htmlFor="file-upload"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200",
              dragActive
                ? "border-primary bg-primary/8 scale-[1.01]"
                : "border-border/50 hover:border-primary/40 hover:bg-card/40"
            )}
          >
            <motion.div
              animate={dragActive ? { scale: 1.1, rotate: -4 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                dragActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              <UploadCloud className="w-8 h-8" />
            </motion.div>
            <div className="text-center">
              <p className="font-semibold text-foreground mb-1">
                {dragActive ? "Drop your file here" : "Upload your conversation"}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag &amp; drop or{" "}
                <span className="text-primary underline underline-offset-2">browse files</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 bg-muted/40 px-4 py-1.5 rounded-full">
              <span>{ACCEPTED_LABEL}</span>
              <span className="opacity-50">·</span>
              <span>Max 200 MB</span>
            </div>
          </label>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Language selector ─────────────────────────────────────────────────────────
function LanguageSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { value: "english", label: "English" },
    { value: "hinglish", label: "Hinglish" },
  ];

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/40">
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
        <Languages className="w-4 h-4" />
        <span className="font-medium">Transcription Language</span>
      </div>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              value === opt.value
                ? "bg-primary text-white shadow-glow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NewAnalysisPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [language, setLanguage] = useState("english");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const handleFile = useCallback((f: File) => {
    if (f.size > MAX_SIZE_BYTES) {
      setError("File exceeds 200 MB limit. Please choose a smaller file.");
      return;
    }
    setError(null);
    setFile(f);
  }, []);

  const canSubmit = mode === "upload" ? !!file : isValidYoutubeUrl(youtubeUrl);

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);

    try {
      const createRes = await api.post("/api/sessions");
      const sessionId = createRes.data.id;

      if (mode === "upload" && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("language", language);
        await api.post(`/api/sessions/${sessionId}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/api/sessions/${sessionId}/youtube`, {
          url: youtubeUrl,
          language,
        });
      }

      router.push(`/sessions/${sessionId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Something went wrong. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <Topbar
        breadcrumbs={[{ label: "New Analysis" }]}
        showNewAnalysis={false}
      />

      <div className="page-container max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">New Analysis</h1>
          <p className="text-muted-foreground">
            Turn a conversation into structured intelligence.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="space-y-5"
        >
          {/* Mode selector */}
          <div className="flex gap-3">
            <ModeCard
              mode="upload"
              active={mode === "upload"}
              icon={UploadCloud}
              title="Upload Media"
              description="Video or audio file from your device"
              onClick={() => { setMode("upload"); setError(null); }}
            />
            <ModeCard
              mode="youtube"
              active={mode === "youtube"}
              icon={Youtube}
              title="YouTube URL"
              description="Paste a YouTube video link"
              onClick={() => { setMode("youtube"); setError(null); }}
            />
          </div>

          {/* Language */}
          <LanguageSelector value={language} onChange={setLanguage} />

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/25 text-red-400"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input panel */}
          <AnimatePresence mode="wait">
            {mode === "upload" ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
              >
                <UploadZone
                  file={file}
                  dragActive={dragActive}
                  onFile={handleFile}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onRemove={() => { setFile(null); setError(null); }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="youtube"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-border/50 bg-card/40 p-6 space-y-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Youtube className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Paste YouTube URL</p>
                    <p className="text-xs text-muted-foreground">
                      youtube.com/watch or youtu.be links
                    </p>
                  </div>
                </div>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 disabled:opacity-50"
                />
                {youtubeUrl && !isValidYoutubeUrl(youtubeUrl) && (
                  <p className="text-xs text-yellow-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    Please enter a valid YouTube URL
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            size="lg"
            className="w-full gap-2 h-12 text-base shadow-glow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Preparing Session...
              </>
            ) : (
              <>
                Start Analysis
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground/60">
            Processing typically takes 2–5 minutes depending on conversation length.
          </p>
        </motion.div>
      </div>
    </AppShell>
  );
}
