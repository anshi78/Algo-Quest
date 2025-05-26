// pages/codex.js
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AlgorithmTracker from "@/components/AlgorithmTracker"; // Make sure this exists

export default function CodexPage() {
  const [learned, setLearned] = useState({
    "Binary Search": false,
    "Bubble Sort": false,
    "DFS": false,
  });

  // Load learned algorithms from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("learnedAlgorithms");
    if (stored) {
      setLearned(JSON.parse(stored));
    }
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-white"
      style={{
        backgroundImage: "url('/assets/images/game-home-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-4xl font-bold mb-6 text-yellow-400 drop-shadow-[0_2px_6px_rgba(255,255,255,0.6)]">
        📖 Codex
      </h1>

      <div className="bg-black/60 p-6 rounded-xl shadow-lg w-full max-w-3xl">
        <AlgorithmTracker learned={learned} />
      </div>

      <Link href="/">
        <button className="mt-8 text-lg px-5 py-3 bg-indigo-700 hover:bg-indigo-600 rounded-lg shadow-md border border-indigo-300 transition">
          ⬅️ Back to Main Menu
        </button>
      </Link>
    </div>
  );
}
