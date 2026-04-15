export default async function GamePoliciesPage({ params }: { params: Promise<{ gameSlug: string }> }) {
  const { gameSlug } = await params;

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Rule Policies</h1>
    </>
  )
}