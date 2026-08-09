"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/i18n/LocaleContext";

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

export function ChatWidget() {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationContext[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || locations.length > 0) return;
    supabase
      .from("locations")
      .select("name, type, address, phone")
      .then(({ data }) => {
        if (data) setLocations(data);
      });
  }, [open, locations.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function handleSend() {
    const text = input.trim();
    if (!text || busy) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, locale, locations }),
      });

      if (res.status === 429) {
        setError(t.chat.rateLimited);
        return;
      }
      if (!res.ok) {
        setError(t.chat.genericError);
        return;
      }

      const data: { reply: string } = await res.json();
      setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
    } catch {
      setError(t.chat.genericError);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-5 bottom-5 z-30 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-paper shadow-lg transition-colors duration-200 hover:bg-primary/90"
      >
        <span aria-hidden>💬</span>
        {t.chat.launcherLabel}
      </button>
    );
  }

  return (
    <div className="fixed inset-x-4 bottom-5 z-30 flex h-[70vh] max-h-[560px] flex-col overflow-hidden rounded-2xl bg-paper shadow-2xl sm:right-5 sm:left-auto sm:w-96">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
        <p className="text-sm font-semibold text-ink">{t.chat.title}</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t.chat.close}
          className="text-muted hover:text-ink"
        >
          ✕
        </button>
      </div>

      <div className="border-b border-status-high/20 bg-status-high/10 px-4 py-2 text-xs font-medium text-status-high">
        {t.chat.emergencyBanner}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        <p className="rounded-xl bg-primary-tint px-3 py-2 text-sm text-ink">{t.chat.intro}</p>

        {messages.map((m, i) => (
          <p
            key={i}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-primary text-paper"
                : "bg-surface text-ink"
            }`}
          >
            {m.content}
          </p>
        ))}

        {busy && <p className="rounded-xl bg-surface px-3 py-2 text-sm text-muted">…</p>}
        {error && (
          <p className="rounded-xl bg-status-high/15 px-3 py-2 text-sm text-status-high">{error}</p>
        )}
      </div>

      <div className="border-t border-black/5 px-4 py-2 text-[11px] leading-snug text-muted">
        <p>{t.chat.disclaimer}</p>
        <p>{t.chat.privacyNote}</p>
      </div>

      <div className="flex items-center gap-2 border-t border-black/5 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t.chat.placeholder}
          disabled={busy}
          className="flex-1 rounded-full bg-surface px-4 py-2 text-sm text-ink placeholder:text-muted focus:outline-primary disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={busy || !input.trim()}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-paper transition-colors duration-200 hover:bg-primary/90 disabled:opacity-50"
        >
          {t.chat.send}
        </button>
      </div>
    </div>
  );
}
