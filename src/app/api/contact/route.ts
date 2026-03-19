import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@schemacheck.dev";
const CONTACT_TO = "onnifyworks@gmail.com";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, subject, message } = (body ?? {}) as Record<string, unknown>;

  if (
    !name || typeof name !== "string" || name.trim().length < 1 ||
    !email || typeof email !== "string" || !email.includes("@") ||
    !message || typeof message !== "string" || message.trim().length < 10
  ) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  const subjectLine = subject && typeof subject === "string" && subject.trim()
    ? subject.trim()
    : "New contact form submission";

  const text = `New contact form submission from SchemaCheck\n\n` +
    `Name: ${name.trim()}\n` +
    `Email: ${email.trim()}\n` +
    `Subject: ${subjectLine}\n\n` +
    `Message:\n${message.trim()}\n`;

  if (!RESEND_API_KEY) {
    console.log("[contact]", text);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: CONTACT_TO,
        reply_to: email.trim(),
        subject: `[SchemaCheck Contact] ${subjectLine}`,
        text,
      }),
    });

    if (!res.ok) {
      console.error("[contact] Resend error:", res.status);
      return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
    }
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
