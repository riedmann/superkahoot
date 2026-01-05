import { FullscreenButton } from "../../components/ui/details/FullscreenButton";

interface WaitingForHostScreenProps {
  gamePin: string;
  nickname: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function WaitingForHostScreen({
  gamePin,
  nickname,
  isFullscreen,
  onToggleFullscreen,
}: WaitingForHostScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-black">
      <FullscreenButton
        isFullscreen={isFullscreen}
        onToggle={onToggleFullscreen}
      />
      <div className="bg-white bg-opacity-10 rounded-xl p-8 shadow-lg flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Waiting for Host</h1>
        <div className="mb-6 text-lg">
          The game will start soon.
          <br />
          Stay ready!
        </div>
        <div className="animate-bounce text-6xl mb-4">⏳</div>
        <div className="text-md opacity-80">
          Game PIN: <span className="font-mono text-2xl">{gamePin}</span>
        </div>
        <div className="mt-8 text-sm opacity-60">
          You are logged in as <span className="font-semibold">{nickname}</span>
        </div>
      </div>
    </div>
  );
}
