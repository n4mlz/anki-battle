import { fromBinary, toBinary, create } from "@bufbuild/protobuf";
import type { DescMessage, MessageInitShape } from "@bufbuild/protobuf";

const ANKI_BASE = "https://ankiweb.net";

export interface AnkiSession {
  cookie: string;
  csrfToken?: string;
}

function decodeResponse<T extends DescMessage>(
  schema: T,
  buffer: Uint8Array,
): Record<string, unknown> {
  return fromBinary(schema, buffer) as Record<string, unknown>;
}

function encodeRequest<T extends DescMessage>(
  schema: T,
  data: Record<string, unknown>,
): Uint8Array {
  const message = create(schema, data as MessageInitShape<T>);
  return toBinary(schema, message);
}

export async function ankiFetch<TReq extends DescMessage, TRes extends DescMessage>(
  path: string,
  requestSchema: TReq,
  requestData: Record<string, unknown>,
  responseSchema: TRes,
  session?: AnkiSession,
): Promise<{ data: Record<string, unknown>; session: AnkiSession }> {
  const url = `${ANKI_BASE}${path}`;
  const body = encodeRequest(requestSchema, requestData);

  const headers: Record<string, string> = {
    "Content-Type": "application/octet-stream",
  };

  if (session?.cookie) {
    headers["Cookie"] = session.cookie;
  }
  if (session?.csrfToken) {
    headers["X-CSRFToken"] = session.csrfToken;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: body as BodyInit,
    redirect: "manual",
  });

  const setCookie =
    response.headers.getSetCookie?.() ?? response.headers.get("set-cookie") ?? "";
  const cookies = Array.isArray(setCookie) ? setCookie.join("; ") : setCookie;

  const newSession: AnkiSession = {
    cookie: cookies || session?.cookie || "",
    csrfToken: session?.csrfToken,
  };

  if (response.status === 403) {
    throw new Error("AUTH_REQUIRED");
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  if (uint8.length === 0) {
    return { data: {}, session: newSession };
  }

  const data = decodeResponse(responseSchema, uint8);
  return { data, session: newSession };
}
