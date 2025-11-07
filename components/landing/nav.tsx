import { ModeToggle } from "../theme-toggle";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-4xl font-lavishly-yours">Amy</h1>
        <ModeToggle />
      </div>
    </nav>
  );
}
