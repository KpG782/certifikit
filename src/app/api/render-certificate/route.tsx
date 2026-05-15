import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/api";
import {
  CertificateImage,
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  type RenderInput,
} from "@/lib/render/certificate";
import type { CertificatePayload } from "@/lib/db/certificates";

export const runtime = "nodejs";

interface RenderRequestBody {
  payload: CertificatePayload;
  backgroundUrl?: string | null;
  width?: number;
  height?: number;
}

function validateBody(raw: unknown): raw is RenderRequestBody {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Record<string, unknown>;
  if (!r.payload || typeof r.payload !== "object") return false;
  const p = r.payload as Record<string, unknown>;
  return Array.isArray(p.textElements) && Array.isArray(p.imageElements);
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!validateBody(body)) {
    return NextResponse.json(
      { error: "Invalid payload — expected { payload: { textElements, imageElements }, backgroundUrl?, width?, height? }" },
      { status: 400 },
    );
  }

  const input: RenderInput = {
    payload: body.payload,
    backgroundUrl: body.backgroundUrl ?? null,
    width: body.width ?? DEFAULT_WIDTH,
    height: body.height ?? DEFAULT_HEIGHT,
  };

  // ImageResponse renders lazily, so a synchronous try/catch here would not
  // catch render errors anyway (and eslint's react-hooks/error-boundaries
  // flags JSX-in-try/catch). Construct the element first, then hand it off.
  const element = CertificateImage(input);
  return new ImageResponse(element, {
    width: input.width!,
    height: input.height!,
  });
}
