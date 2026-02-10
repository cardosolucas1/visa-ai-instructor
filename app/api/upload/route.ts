import crypto from "crypto";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ ok: false, message: "invalid_type" }, { status: 415 });
  }

  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ ok: false, message: "file_too_large" }, { status: 413 });
  }

  return NextResponse.json({
    ok: true,
    fileId: crypto.randomUUID(),
    filename: file.name,
    size: file.size,
    type: file.type,
  });
}
