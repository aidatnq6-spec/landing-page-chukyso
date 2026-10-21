import { requireAdmin } from "@/lib/server/admin-auth";
import { listRegistrations } from "@/lib/server/admin-registrations";
import { failure, json } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    return json(await listRegistrations(new URL(request.url).searchParams));
  } catch (error) {
    return failure(error);
  }
}
