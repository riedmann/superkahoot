interface DisconnectedScreenProps {
  reason?: string;
}

export function DisconnectedScreen({ reason }: DisconnectedScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800">
      <div className="text-center text-white px-4">
        <div className="mb-6">
          <svg
            className="w-24 h-24 mx-auto text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Disconnected</h1>
        <p className="text-xl md:text-2xl mb-8">
          {reason || "You have been disconnected from the game"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-white text-red-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
