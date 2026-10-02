"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Session } from "@/types/session";
import ProcessingStatus from "@/components/processing-status";
import ChatPanel from "@/components/chat-panel";
import Link from "next/link";

export default function SessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchSession();
  }, [params.id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!session) return <div className="p-8 text-center text-red-500">Session not found</div>;

  if (session.status !== "completed" && session.status !== "failed") {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto flex flex-col justify-center">
        <ProcessingStatus sessionId={session.id} onComplete={fetchSession} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto flex gap-8">
      {/* Sidebar Navigation (simplified) */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2">
        <Link href="/dashboard" className="mb-6 text-gray-400 hover:text-white flex items-center gap-2">
          ← Back to Dashboard
        </Link>
        
        <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          MeetMind AI
        </h1>
        
        <div className="space-y-1">
          {["Overview", "Summary", "Transcript", "Insights"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="block px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>
        
        <div className="mt-auto">
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${session.id}/export/txt`} target="_blank" rel="noreferrer" className="block w-full text-center py-2 px-4 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors text-sm">
            📄 Export TXT
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-8 pb-20">
        <div id="overview" className="border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold mb-2">{session.title || "Untitled Session"}</h1>
          <p className="text-gray-500">ID: {session.id}</p>
        </div>

        <div id="summary" className="bg-[#111118] border border-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">📋 Summary</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {session.summary}
          </div>
        </div>

        <div id="insights" className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#111118] border border-gray-800 p-6 rounded-xl">
            <h3 className="font-semibold mb-4 text-green-400">✅ Action Items</h3>
            <div className="text-gray-300 text-sm whitespace-pre-wrap">{session.action_items}</div>
          </div>
          <div className="bg-[#111118] border border-gray-800 p-6 rounded-xl">
            <h3 className="font-semibold mb-4 text-blue-400">🔑 Key Decisions</h3>
            <div className="text-gray-300 text-sm whitespace-pre-wrap">{session.decisions}</div>
          </div>
          <div className="bg-[#111118] border border-gray-800 p-6 rounded-xl">
            <h3 className="font-semibold mb-4 text-yellow-400">❓ Open Questions</h3>
            <div className="text-gray-300 text-sm whitespace-pre-wrap">{session.open_questions}</div>
          </div>
        </div>

        <div id="transcript" className="bg-[#111118] border border-gray-800 p-6 rounded-xl max-h-[400px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">📝 Transcript</h2>
          {session.transcript && session.transcript.length > 0 ? (
            <div className="space-y-4">
              {session.transcript.map((t, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-16 text-xs text-gray-500 font-mono mt-1 shrink-0 group-hover:text-purple-400 transition-colors">
                    {t.start ? new Date(t.start * 1000).toISOString().substr(11, 8) : "00:00:00"}
                  </div>
                  <div className="text-gray-300 leading-relaxed">
                    {t.speaker && <span className="font-semibold text-gray-400 mr-2">{t.speaker}:</span>}
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No transcript available.</div>
          )}
        </div>
      </div>

      {/* Chat Panel Sidebar */}
      <div className="w-[400px] flex-shrink-0">
        <div className="sticky top-8">
          <ChatPanel sessionId={session.id} />
        </div>
      </div>
    </div>
  );
}
