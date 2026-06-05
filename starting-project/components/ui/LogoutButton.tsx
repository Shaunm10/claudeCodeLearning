"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  if (!session) return null;

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
    >
      Log out
    </button>
  );
}
