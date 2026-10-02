"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

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
            onComplete();
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, onComplete]);

  if (!status) return <div className="text-gray-500">Checking status...</div>;
  if (status.status === "failed") return <div className="text-red-500">Processing failed: {status.stage}</div>;

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
    <div className="bg-[#111118] border border-gray-800 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-6">Analyzing your session...</h2>
      
      <div className="w-full bg-gray-800 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-purple-600 h-full transition-all duration-500" 
          style={{ width: `${status.progress}%` }}
        />
      </div>

      <div className="space-y-4">
        {stages.map((stage, idx) => {
          let state = "pending";
          if (status.status === "completed") state = "done";
          else if (status.stage === stage.key) state = "active";
          else {
            const currentIdx = stages.findIndex(s => s.key === status.stage);
            if (idx < currentIdx) state = "done";
          }
          
          return (
            <div key={stage.key} className={`flex items-center gap-3 ${state === 'pending' ? 'text-gray-600' : 'text-gray-200'}`}>
              <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                state === 'done' ? 'bg-green-500' : 
                state === 'active' ? 'bg-purple-500 animate-pulse' : 'bg-gray-800'
              }`} />
              <span className={state === 'active' ? 'font-semibold' : ''}>{stage.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  );
}
