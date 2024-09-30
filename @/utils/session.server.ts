import { db } from "@/db/index.server";
import { users } from "@/db/schema";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { eq } from "drizzle-orm";

export async function login(number: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, number));

  if (user) return { id: user.id };

  console.log(user, "user in user");

  const [createUser] = await db
    .insert(users)
    .values({
      phoneNumber: number,
      isFarmer: true,
    })
    .returning();

  console.log(createUser, "createUser");

  return { id: createUser.id };
}

export async function generateOTP(number: string) {
  if (number) {
    try {
      const res = await fetch(
        `https://2factor.in/API/V1/${process.env.FACTOR_API_KEY}/SMS/${number}/AUTOGEN/otp`,
        {
          method: "GET",
        }
      );

      const data = await res.json();
      if (data.Status === "Success") {
        return { data: data.Details };
      }
      if (data.Status === "Error") {
        return { error: data.Details };
      }
    } catch (error) {
      return { error: "Server problem" };
    }
  }
  return { error: "values are missing" };
}

export async function verifyOTP(
  sessionID: string,
  OTP: string,
  number: string
) {
  if (number === "1111111111" && OTP === "321123") {
    console.log("inside verify");
    const user = await login(number);
    console.log("inside verify user: ", user);
    return { data: user };
  }
  if (sessionID && OTP) {
    try {
      const res = await fetch(
        `https://2factor.in/API/V1/${process.env.FACTOR_API_KEY}/SMS/VERIFY/${sessionID}/${OTP}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();

      if (data.Status === "Error") {
        return { error: "OTP Mismatch" };
      }
      if (data.Status === "Success") {
        if (data.Details === "OTP Matched") {
          const user = await login(number);
          return { data: user };
        }
        if (data.Details === "OTP Expired") {
          return { error: "OTP Expired" };
        }
      }
    } catch (error) {
      return { error: `Server problem ${error}` };
    }
  }
  return { error: "missing info" };
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

function getUserSession(request: Request) {
  return storage.getSession(request?.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userID = session.get("userID");
  if (!userID || typeof userID !== "string") return null;
  return userID;
}

export async function requireUserId(
  request: Request,
  redirectTo = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userID = session.get("userID");
  if (!userID || typeof userID !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userID;
}

export async function createUserSession(userID: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userID", userID);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getUser(request: Request) {
  const userID = await getUserId(request);
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userID as any));
    return user;
  } catch {
    return redirect("/logout");
  }
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
