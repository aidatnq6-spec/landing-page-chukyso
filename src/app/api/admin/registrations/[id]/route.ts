import { requireAdmin } from "@/lib/server/admin-auth";
import {
  getRegistration,
  updateRegistration,
} from "@/lib/server/admin-registrations";
import { failure, json, readJson } from "@/lib/server/http";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  try {
    await requireAdmin(request);
    return json(await getRegistration((await context.params).id));
  } catch (error) {
    return failure(error);
  }
}
export async function PATCH(request: Request, context: Context) {
  try {
    await requireAdmin(request);
    return json(
      await updateRegistration(
        (await context.params).id,
        await readJson(request),
      ),
    );
  } catch (error) {
    return failure(error);
  }
}
