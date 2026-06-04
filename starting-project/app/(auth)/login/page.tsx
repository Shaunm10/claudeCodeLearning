import { AuthForm } from "@/components/ui/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const resolvedMode = mode === "register" ? "register" : "login";

  return <AuthForm defaultMode={resolvedMode} key={resolvedMode} />;
}
