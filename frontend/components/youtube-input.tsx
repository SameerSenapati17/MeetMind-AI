"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function YoutubeInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      // 1. create session
      const createRes = await api.post("/api/sessions");
      const sessionId = createRes.data.id;
      
      // 2. submit youtube URL
      await api.post(`/api/sessions/${sessionId}/youtube`, { url, language: "english" });
      
      router.push(`/sessions/${sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input 
        type="url" 
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
        className="w-full bg-black border border-gray-700 rounded p-3 focus:border-purple-500 outline-none"
        required
      />
      <button 
        type="submit" 
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded transition-colors disabled:opacity-50"
      >
        {loading ? "Starting..." : "Analyze URL"}
      </button>
    </form>
  );
}
