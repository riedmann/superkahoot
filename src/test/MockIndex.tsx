import { Link } from "react-router-dom";

export function MockIndex() {
  const mocks = [
    { path: "/leaderboard-mock", name: "Leaderboard" },
    { path: "/winner-mock", name: "Winner Screen" },
    { path: "/server-question-mock", name: "Question With Image (Host)" },
    {
      path: "/server-question-no-image-mock",
      name: "Question Without Image (Host)",
    },
    { path: "/client-question-mock2", name: "Question Screen (Client) 1" },
    { path: "/client-question-mock1", name: "Question Screen (Client) 2" },
    { path: "/question-result-mock", name: "Question Result" },
    { path: "/ws-test", name: "WebSocket Test" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 to-blue-700 flex items-center justify-center p-8">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎭 Component Mocks
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mocks.map((mock) => (
            <Link
              key={mock.path}
              to={mock.path}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl text-center"
            >
              {mock.name}
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/" className="text-white/80 hover:text-white underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
