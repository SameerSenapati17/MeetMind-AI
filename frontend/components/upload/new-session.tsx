"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Link as LinkIcon, Languages, Video } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsGroup, TabsListGroup, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function NewSession() {
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    try {
      const createRes = await api.post("/api/sessions");
      const sessionId = createRes.data.id;
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);

      await api.post(`/api/sessions/${sessionId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      router.push(`/sessions/${sessionId}`);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.detail || "Failed to upload file. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  const handleYoutube = async () => {
    if (!youtubeUrl || loading) return;
    setLoading(true);
    setError(null);
    try {
      const createRes = await api.post("/api/sessions");
      const sessionId = createRes.data.id;
      
      await api.post(`/api/sessions/${sessionId}/youtube`, {
        url: youtubeUrl,
        language
      });
      router.push(`/sessions/${sessionId}`);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.detail || "Failed to process YouTube URL. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <TabsGroup defaultValue="upload">
          <TabsListGroup className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              YouTube URL
            </TabsTrigger>
          </TabsListGroup>

          <div className="mb-6 flex items-center justify-between bg-muted/50 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Languages className="w-4 h-4" />
              <span>Language</span>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-background border border-border rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="english">English</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <TabsContent value="upload">
            <div className="flex flex-col gap-4">
              <div 
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <input 
                  type="file" 
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="hidden" 
                  id="file-upload"
                  accept=".mp4,.mov,.mkv,.avi,.webm,.mp3,.wav,.m4a"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className={`p-4 rounded-full mb-4 ${file ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Video className="w-8 h-8" />
                  </div>
                  <p className="text-foreground font-medium mb-1">
                    {file ? file.name : "Click or drag & drop"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    MP4, MP3, WAV, etc. (Max 200MB)
                  </p>
                </label>
              </div>
              <Button 
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Preparing Session..." : "Upload & Analyze"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="youtube">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-muted-foreground">Video URL</label>
                <input 
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleYoutube}
                disabled={!youtubeUrl || loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Preparing Session..." : "Analyze YouTube Video"}
              </Button>
            </div>
          </TabsContent>
        </TabsGroup>
      </CardContent>
    </Card>
  );
}
