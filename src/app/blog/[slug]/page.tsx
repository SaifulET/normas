import { notFound } from "next/navigation";
import { BlogDetailPage } from "@/components/blog/blog-page";
import { getBlog } from "@/lib/blog-api";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let blog;

  try {
    const response = await getBlog(slug);
    blog = response.data;
  } catch {
    notFound();
  }

  return <BlogDetailPage blog={blog} />;
}
