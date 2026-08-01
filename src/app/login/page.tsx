import { LoginPageView } from "@/components/auth/auth-pages";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    redirect?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectParam = params?.redirect;
  const redirectPath = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam;

  if (
    redirectPath &&
    redirectPath.startsWith("/") &&
    !redirectPath.startsWith("//") &&
    (await isAuthenticated())
  ) {
    redirect(redirectPath);
  }

  return <LoginPageView redirectPath={redirectPath ?? null} />;
}
