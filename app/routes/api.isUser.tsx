import { db } from "@/db/index.server";
import { users, Users } from "@/db/schema";
import { getUser } from "@/utils/session.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { eq } from "drizzle-orm";

export async function loader({ request }: LoaderFunctionArgs) {
  const number = new URL(request.url).searchParams.get("number");
  console.log(number, "number");
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, number as string));

  return { user: user ? true : false };
}
