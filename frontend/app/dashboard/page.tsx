"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Session } from "@/types/session";
import UploadZone from "@/components/upload-zone";
import YoutubeInput from "@/components/youtube-input";

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    api.get("/api/sessions").then(res => setSessions(res.data)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8">Upload a session or paste a YouTube URL to get started.</p>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-[#111118] border border-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Upload Local Media</h2>
          <UploadZone />
        </div>
        <div className="bg-[#111118] border border-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">YouTube URL</h2>
          <YoutubeInput />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Recent Sessions</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {sessions.map(s => (
          <Link href={`/sessions/${s.id}`} key={s.id}>
            <div className="p-4 bg-[#111118] border border-gray-800 rounded-lg hover:border-purple-500 transition-colors">
              <h3 className="font-semibold truncate">{s.title || "Untitled Session"}</h3>
              <p className="text-sm text-gray-500 capitalize">{s.status}</p>
            </div>
          </Link>
        ))}
        {sessions.length === 0 && (
          <p className="text-gray-500">No sessions yet.</p>
        )}
      </div>
    </div>
  );
}
