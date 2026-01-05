import { FullscreenButton } from "../../components/ui/details/FullscreenButton";

interface FinishedScreenProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function FinishedScreen({
  isFullscreen,
  onToggleFullscreen,
}: FinishedScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <FullscreenButton
        isFullscreen={isFullscreen}
        onToggle={onToggleFullscreen}
      />
      <div className="p-8 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-4">Das Spiel ist beendet!</h2>
        <p className="text-lg">Danke fürs Mitspielen!</p>
      </div>
    </div>
  );
}
