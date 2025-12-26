import React from "react";

export function CountdownScreen({ countdown }: { countdown: number }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 z-50 flex items-center justify-center">
      <div className="text-center text-white">
        <h2 className="text-3xl font-bold mb-6">Get Ready!</h2>
        <div className="text-8xl font-extrabold animate-pulse">{countdown}</div>
      </div>
    </div>
  );
}
