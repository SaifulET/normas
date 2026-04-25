import { SearchPage } from "@/components/search/search-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string | string[] }>;
}) {
  const params = await searchParams;
  const keyword = Array.isArray(params.keyword) ? (params.keyword[0] ?? "") : (params.keyword ?? "");

  return <SearchPage initialKeyword={keyword} />;
}
