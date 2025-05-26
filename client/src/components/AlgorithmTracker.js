// components/AlgorithmTracker.js
import React, { useState } from "react";

const tabs = ["Binary Search", "Bubble Sort", "DFS"];

export default function AlgorithmTracker({ learned }) {
  const [activeTab, setActiveTab] = useState("Binary Search");

  return (
    <div>
      <div className="flex justify-center space-x-4 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {learned[tab] ? "✅ " : "❌ "} {tab}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow text-sm">
        {activeTab === "Binary Search" && (
          <p>
            Binary Search is an efficient algorithm for finding an item from a sorted list...
          </p>
        )}
        {activeTab === "Bubble Sort" && (
          <p>
            Bubble Sort is a simple sorting algorithm that repeatedly steps through the list...
          </p>
        )}
        {activeTab === "DFS" && (
          <p>
            Depth-First Search (DFS) explores as far as possible along each branch before backtracking...
          </p>
        )}
      </div>
    </div>
  );
}
