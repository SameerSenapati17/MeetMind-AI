"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function UploadZone() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // 1. create session
      const createRes = await api.post("/api/sessions");
      const sessionId = createRes.data.id;
      
      // 2. upload file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", "english");

      await api.post(`/api/sessions/${sessionId}/upload`, formData);
      
      router.push(`/sessions/${sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
        <input 
          type="file" 
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="hidden" 
          id="file-upload"
          accept=".mp4,.mov,.mkv,.avi,.webm,.mp3,.wav,.m4a"
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          <div className="text-4xl mb-2">📁</div>
          <p className="text-gray-300 font-semibold">{file ? file.name : "Click to select a file"}</p>
          <p className="text-gray-500 text-sm mt-2">MP4, MP3, WAV, etc. (Max 200MB)</p>
        </label>
      </div>
      <button 
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded transition-colors disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload & Analyze"}
      </button>
    </div>
  );
}
