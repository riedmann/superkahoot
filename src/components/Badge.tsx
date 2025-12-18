interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "difficulty-easy"
    | "difficulty-medium"
    | "difficulty-hard";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: "bg-gray-100 text-gray-600",
    "difficulty-easy": "bg-green-100 text-green-800",
    "difficulty-medium": "bg-yellow-100 text-yellow-800",
    "difficulty-hard": "bg-red-100 text-red-800",
  };

  const baseStyles =
    "px-3 py-1 rounded-full text-xs font-semibold uppercase whitespace-nowrap";

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
