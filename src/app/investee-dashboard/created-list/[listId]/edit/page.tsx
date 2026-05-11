import { CreateListPage } from "@/components/dashboard/create-list-page";

export default async function InvesteeEditCreatedListPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;

  return <CreateListPage listId={listId} />;
}
