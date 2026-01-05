interface ErrorScreenProps {
  error: string;
  isReconnecting: boolean;
  onRetry: () => void;
}

export function ErrorScreen({
  error,
  isReconnecting,
  onRetry,
}: ErrorScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-red-800">
      <div className="bg-white bg-opacity-90 rounded-xl p-8 shadow-lg flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">
          Verbindungsfehler mit WebSocket
        </h1>
        <p className="mb-6">{error}</p>
        {isReconnecting ? (
          <p className="italic">Attempting to reconnect...</p>
        ) : (
          <button
            onClick={onRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow transition"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
}
