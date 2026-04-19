import { cookies } from "next/headers";

export const SESSION_COOKIE = "popcorn_session";

export async function getSessionId(): Promise<string> {
  const store = await cookies();
  const id = store.get(SESSION_COOKIE)?.value;
  if (!id) throw new Error("Session cookie missing");
  return id;
}
