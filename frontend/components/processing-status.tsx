"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, BrainCircuit } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ProcessingStatus({ sessionId, onComplete }: { sessionId: string, onComplete: () => void }) {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/sessions/${sessionId}/status`);
        setStatus(res.data);
        if (res.data.status === "completed" || res.data.status === "failed") {
          clearInterval(interval);
          if (res.data.status === "completed") {
            setTimeout(() => onComplete(), 1000); 
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, onComplete]);

  if (!status) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in duration-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm">Connecting to MeetMind...</p>
      </div>
    );
  }

  if (status.status === "failed") {
    return (
      <Card className="border-red-500/30 bg-red-500/5 shadow-none max-w-xl mx-auto w-full">
        <CardContent className="p-8 flex flex-col items-center text-center">
          <XCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-red-500 mb-2">Processing Failed</h2>
          <p className="text-muted-foreground text-sm max-w-md">{status.stage}</p>
        </CardContent>
      </Card>
    );
  }

  const stages = [
    { key: "queued", label: "Queued" },
    { key: "downloading", label: "Downloading / Uploading Media" },
    { key: "extracting_audio", label: "Extracting Audio" },
    { key: "transcribing", label: "Generating Transcript" },
    { key: "generating_summary", label: "Understanding Session" },
    { key: "extracting_insights", label: "Finding Decisions & Actions" },
    { key: "building_knowledge_base", label: "Building AI Knowledge Base" },
    { key: "completed", label: "Done" },
  ];

  return (
    <Card className="max-w-xl mx-auto w-full overflow-hidden border-border/50 shadow-surface-lg animate-in fade-in zoom-in-95 duration-500">
      <CardContent className="p-0">
        <div className="p-8 pb-6 border-b border-border/40 bg-card/60 backdrop-blur-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-glow-sm">
            <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Analyzing Session</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
            MeetMind is processing your conversation. This may take a few minutes depending on the length.
          </p>
        </div>
        
        <div className="p-8 bg-card/30">
          <div className="w-full bg-muted/60 h-2.5 rounded-full mb-8 overflow-hidden border border-border/40">
            <motion.div 
              className="bg-primary h-full rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${status.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="space-y-5 relative">
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/60 -z-10" />
            
            {stages.map((stage, idx) => {
              let state = "pending";
              if (status.status === "completed") state = "done";
              else if (status.stage === stage.key) state = "active";
              else {
                const currentIdx = stages.findIndex(s => s.key === status.stage);
                if (idx < currentIdx) state = "done";
              }
              
              return (
                <div key={stage.key} className={cn("flex items-center gap-4 transition-all duration-300", state === 'pending' ? 'opacity-40' : 'opacity-100')}>
                  <div className={cn(
                    "w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center bg-card border-2 transition-all duration-300",
                    state === 'done' ? 'border-primary bg-primary' : 
                    state === 'active' ? 'border-primary ring-4 ring-primary/20 bg-card' : 'border-muted'
                  )}>
                    {state === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={cn("text-sm", state === 'active' ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                    {stage.label}
                  </span>
                  {state === 'active' && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary ml-auto" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
