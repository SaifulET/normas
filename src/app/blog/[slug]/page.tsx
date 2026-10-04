import { BlogDetailPage } from "@/components/blog/blog-page";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogDetailPage slug={slug} />;
}
