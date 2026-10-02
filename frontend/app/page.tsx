import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#0a0a0f] text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col gap-6">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          MeetMind AI
        </h1>
        <p className="text-xl text-gray-400 uppercase tracking-widest text-center">
          Turn every conversation into actionable intelligence.
        </p>
        <Link 
          href="/dashboard"
          className="mt-8 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-lg font-semibold transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
