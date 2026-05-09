import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function toE164(phone: string): string {
  // Stored format: "0612345678" (normalized by AuthContext)
  if (phone.startsWith("0")) return "+33" + phone.slice(1);
  return phone;
}

export async function POST(request: Request) {
  try {
    const { message, phones } = await request.json() as { message: string; phones: string[] };

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }
    if (!Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json({ error: "Aucun destinataire" }, { status: 400 });
    }

    const from = process.env.TWILIO_PHONE_NUMBER!;

    const results = await Promise.allSettled(
      phones.map(phone =>
        client.messages.create({ body: message, from, to: toE164(phone) })
      )
    );

    const sent   = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    return NextResponse.json({ sent, failed, total: phones.length });
  } catch (err) {
    console.error("[send-promo]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
