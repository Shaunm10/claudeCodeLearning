export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Hello World</h1>
        <h2 className="text-lg font-semibold mb-2">Advantages of Claude Code</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Understands entire codebases, not just individual files</li>
          <li>Runs shell commands, tests, and builds directly in your environment</li>
          <li>Edits multiple files in a single pass to complete complex tasks</li>
          <li>Reads git history and diffs to understand context behind changes</li>
          <li>Works with any language or framework without special configuration</li>
          <li>Integrates with VS Code, JetBrains, and the terminal simultaneously</li>
          <li>Supports custom slash commands and hooks for automated workflows</li>
        </ul>
      </div>
    </div>
  );
}
