import { FullscreenExitIcon } from "./FullscreenExitIcon";
import { FullscreenExpandIcon } from "./FullscreenExpandIcon";

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
  className?: string;
}

export function FullscreenButton({
  isFullscreen,
  onToggle,
  className,
}: FullscreenButtonProps) {
  const defaultClasses = "fixed top-4 right-4 bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-lg transition z-50";
  
  return (
    <button
      onClick={onToggle}
      className={className || defaultClasses}
      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenExpandIcon />}
    </button>
  );
}
