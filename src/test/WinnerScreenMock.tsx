import { WinnersScreen } from "../games/host/WinnersScreen";

export function WinnerScreenMock() {
  const mockWinners = [
    { id: "player-1", name: "Alice Johnson", points: 2850 },
    { id: "player-2", name: "Bob Smith", points: 2400 },
    { id: "player-3", name: "Charlie Brown", points: 2100 },
    { id: "player-4", name: "Diana Prince", points: 1950 },
    { id: "player-5", name: "Eve Martinez", points: 1800 },
    { id: "player-6", name: "Frank Castle", points: 1600 },
    { id: "player-7", name: "Grace Hopper", points: 1400 },
    { id: "player-8", name: "Henry Ford", points: 1200 },
    { id: "player-9", name: "Iris West", points: 1100 },
    { id: "player-10", name: "Jack Ryan", points: 1000 },
  ];

  return (
    <div className="h-screen">
      <WinnersScreen
        winners={mockWinners}
        onBack={() => console.log("Back clicked")}
      />
    </div>
  );
}
