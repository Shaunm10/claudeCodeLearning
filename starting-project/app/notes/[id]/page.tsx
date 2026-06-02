export default function NotePage({ params }: { params: { id: string } }) {
  return <div>Note Page: {params.id}</div>;
}
