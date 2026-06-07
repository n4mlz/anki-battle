import { ankiFetch, AnkiSession } from "./client";
import { LoginRequestSchema, LoginResponseSchema } from "./proto";

export async function loginAnkiWeb(
  email: string,
  password: string
): Promise<AnkiSession> {
  const { session } = await ankiFetch(
    "/svc/account/login",
    LoginRequestSchema,
    { username: email, password },
    LoginResponseSchema
  );
  return session;
}
