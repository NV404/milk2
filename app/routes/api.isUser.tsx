import { db } from "@/db/index.server";
import { users, Users } from "@/db/schema";
import { getUser } from "@/utils/session.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { eq } from "drizzle-orm";

export async function loader({ request }: LoaderFunctionArgs) {
  const body = await request.json();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, body?.number));

  return { user: user ? true : false };
}
