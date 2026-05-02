import React from "react";

/**
 * TestComponent - Deprecated
 * This component was used for testing WebSocket connections.
 * The application now uses Firebase Realtime Database instead of WebSockets.
 * This component is kept for reference but is no longer functional.
 */

export const TestComponent: React.FC = () => {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-yellow-800 mb-2">
          Component Deprecated
        </h2>
        <p className="text-yellow-700">
          This test component was used for WebSocket testing. The application
          has been migrated to Firebase Realtime Database.
        </p>
        <p className="text-yellow-700 mt-2">
          See{" "}
          <code className="bg-yellow-100 px-2 py-1 rounded">MIGRATION.md</code>{" "}
          for details.
        </p>
      </div>
    </div>
  );
};
