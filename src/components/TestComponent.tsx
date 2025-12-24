import React, { useRef, useState } from "react";

/**
 * TestComponent for manual testing of WebSocket (ws) functions.
 * Allows sending custom messages and displays all received messages.
 */
const WS_URL = "ws://localhost:8080";

export const TestComponent: React.FC = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // Connect to WebSocket
  const connect = () => {
    if (wsRef.current) wsRef.current.close();
    const ws = new window.WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => {
      setIsConnected(true);
      setLog((l) => ["[open] Connected", ...l]);
    };
    ws.onmessage = (event) => {
      setLog((l) => ["[message] " + event.data, ...l]);
    };
    ws.onerror = (e) => {
      setLog((l) => ["[error] " + JSON.stringify(e), ...l]);
    };
    ws.onclose = () => {
      setIsConnected(false);
      setLog((l) => ["[close] Disconnected", ...l]);
    };
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    wsRef.current?.close();
  };

  // Send message
  const sendMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    wsRef.current.send(message);
    setLog((l) => ["[send] " + message, ...l]);
    setMessage("");
  };

  // Predefined test messages
  const testMessages = [
    { label: "Get Server Time", msg: JSON.stringify({ type: "get_time" }) },
    {
      label: "Join Game",
      msg: JSON.stringify({
        type: "join_game",
        gameId: "123456",
        player: "TestUser",
      }),
    },
    {
      label: "Submit Answer",
      msg: JSON.stringify({
        type: "submit_answer",
        gameId: "123456",
        answer: "A",
      }),
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 600,
        margin: "40px auto",
        background: "#f9f9f9",
        borderRadius: 8,
      }}
    >
      <h2>WebSocket TestComponent</h2>
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={connect}
          disabled={isConnected}
          style={{ marginRight: 8 }}
        >
          Connect
        </button>
        <button onClick={disconnect} disabled={!isConnected}>
          Disconnect
        </button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message (JSON)"
          style={{ width: 300, marginRight: 8 }}
        />
        <button onClick={sendMessage} disabled={!isConnected || !message}>
          Send
        </button>
      </div>
      <div style={{ marginBottom: 12 }}>
        {testMessages.map((tm) => (
          <button
            key={tm.label}
            onClick={() => {
              setMessage(tm.msg);
            }}
            style={{ marginRight: 8, marginBottom: 4 }}
            disabled={!isConnected}
          >
            {tm.label}
          </button>
        ))}
      </div>
      <div
        style={{
          maxHeight: 300,
          overflow: "auto",
          background: "#fff",
          border: "1px solid #ccc",
          padding: 8,
        }}
      >
        <pre style={{ fontSize: 12 }}>
          {log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </pre>
      </div>
    </div>
  );
};
