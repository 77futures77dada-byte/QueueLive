import { NextResponse } from "next/server";

// Legacy but still officially supported REST endpoint (Google's newer
// "Interactions API" is recommended for new projects, but generateContent
// is simpler for a stateless per-request chat like this one and is what
// was specified for this integration).
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const LANGUAGE_NAMES: Record<string, string> = {
  et: "Estonian",
  ru: "Russian",
  en: "English",
};

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface LocationContext {
  name: string;
  type: string;
  address: string | null;
  phone: string | null;
}

function buildSystemPrompt(locale: string, locations: LocationContext[]): string {
  const languageName = LANGUAGE_NAMES[locale] ?? "English";
  const locationList = locations.length
    ? locations
        .map((l) => `- ${l.name} (${l.type}), ${l.address ?? "address unknown"}${l.phone ? `, tel. ${l.phone}` : ""}`)
        .join("\n")
    : "(no location data available right now)";

  return `You are the health-assistant chatbot embedded in a Tallinn, Estonia web app that shows live ER/clinic wait times. You have two jobs: (1) help the user figure out which nearby hospital/clinic fits their situation, and (2) help them understand what might be going on with symptoms they describe and how urgent it is.

KNOWN LOCATIONS IN THE APP:
${locationList}
When recommending one, also tell the user to check the app's map for that location's current live wait time, since it changes.

ABSOLUTE PRIORITY RULE — this overrides everything else and must be checked first on every message:
If the user describes any sign of a life-threatening emergency — loss of consciousness, severe or uncontrolled bleeding, difficulty breathing or choking, sudden severe chest pain, sudden one-sided weakness, facial drooping, or slurred speech (stroke signs), severe head trauma, signs of a heart attack, anaphylaxis/severe allergic reaction, or anything comparably urgent — your entire reply must start with a direct, unambiguous instruction to call 112 immediately. Keep that instruction short and first. Do not soften it, do not add caveats before it, do not wait for more detail before saying it.

FOR EVERYTHING ELSE (non-emergency symptoms or general questions):
Be direct, substantive, and genuinely useful — do not default to "see a doctor" as a reflexive answer to every question. Give an honest, conversational read on what's likely going on and how urgent it is. You can say things like "sounds like it could be..." or "this is often related to...", but never state a diagnosis as settled fact ("you have X"). If something genuinely sounds minor, say so plainly instead of hedging. Recommend seeing a doctor or going to an ER only when that's actually warranted, and briefly say why.

Respond only in ${languageName}, as plain conversational sentences — never use markdown formatting (no **bold**, no bullet points, no headers, no numbered lists). Keep it to a short paragraph (roughly 2-5 sentences) unless the user is clearly asking for more detail. Never ask the user for personal identifying information, and if they volunteer it, don't repeat it back.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  let body: { messages?: ChatMessage[]; locale?: string; locations?: LocationContext[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const locale = typeof body.locale === "string" ? body.locale : "en";
  const locations = Array.isArray(body.locations) ? body.locations : [];

  const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildSystemPrompt(locale, locations) }],
      },
      contents: messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 700,
        // gemini-3.6-flash defaults to "medium" thinking, which can burn the
        // entire maxOutputTokens budget on invisible reasoning before
        // writing any reply (finishReason MAX_TOKENS with a truncated or
        // empty answer). Even "low" observed spending 900+ tokens on
        // thinking alone — "minimal" is what actually skips that for this
        // simple, low-latency conversational use case.
        thinkingConfig: {
          thinkingLevel: "minimal",
        },
      },
    }),
  });

  if (geminiResponse.status === 429) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!geminiResponse.ok) {
    console.error("Gemini API error:", geminiResponse.status, await geminiResponse.text());
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }

  const data = await geminiResponse.json();
  const reply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }

  return NextResponse.json({ reply });
}
