import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground", className)}
    >
      <g
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 10L16 18L26 10V22C26 23.1 25.1 24 24 24H8C6.9 24 6 23.1 6 22V10Z" />
        <path d="M6 10L16 18L26 10" />
      </g>
      <path
        d="M16 14C16 14 18.5 11.5 20 10C21.5 8.5 21.5 7 20.5 6.5C19.5 6 18 6.5 16 8C14 6.5 12.5 6 11.5 6.5C10.5 7 10.5 8.5 12 10C13.5 11.5 16 14 16 14Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}
