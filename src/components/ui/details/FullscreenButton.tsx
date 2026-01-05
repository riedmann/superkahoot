import { FullscreenExitIcon } from "./FullscreenExitIcon";
import { FullscreenExpandIcon } from "./FullscreenExpandIcon";

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export function FullscreenButton({
  isFullscreen,
  onToggle,
}: FullscreenButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-lg transition z-50"
      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenExpandIcon />}
    </button>
  );
}
