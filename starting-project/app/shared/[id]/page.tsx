export default async function SharedNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>Shared Note Page: {id}</div>;
}
