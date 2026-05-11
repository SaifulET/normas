import { clearAuthenticatedSession } from "@/lib/auth";
import { clearSuperadminSession } from "@/lib/superadmin-auth";

export async function POST() {
  await clearAuthenticatedSession();
  await clearSuperadminSession();

  return Response.json({ success: true });
}
