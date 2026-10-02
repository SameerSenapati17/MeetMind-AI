"use client";
import { useState } from "react";
import api from "@/lib/api";

export default function ChatPanel({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<{role: string, content: string, sources?: any[]}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post(`/api/sessions/${sessionId}/chat`, { message: userMsg });
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: res.data.answer,
        sources: res.data.sources
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#111118] border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50">
        <h2 className="font-semibold flex items-center gap-2">💬 Ask MeetMind</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            Ask anything about this session...
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{m.role === 'user' ? 'You' : 'MeetMind'}</span>
            <div className={`p-3 rounded-lg max-w-[85%] ${m.role === 'user' ? 'bg-purple-900/50 border border-purple-800' : 'bg-gray-800 border border-gray-700'}`}>
              {m.content}
            </div>
            {m.sources && m.sources.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 max-w-[85%]">
                <span className="font-semibold">Sources:</span> {m.sources.map((s:any, idx:number) => (
                  <span key={idx} className="block mt-1 italic opacity-70">"{s.text}"</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider">MeetMind</span>
            <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-gray-900/50 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="What decisions were made?"
          className="flex-1 bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-purple-500"
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  );
}
