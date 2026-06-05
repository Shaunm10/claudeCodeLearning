import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-black/[0.08] bg-background dark:border-white/[0.08]">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight hover:opacity-75 transition-opacity"
        >
          NextNotes
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
