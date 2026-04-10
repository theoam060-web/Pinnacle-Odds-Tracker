import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Mail, RefreshCw, ChevronRight } from "lucide-react";

const API_BASE = (() => {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const parts = base.split("/").filter(Boolean);
  const slug = parts[0];
  const domain = window.location.hostname;
  if (slug) {
    return `https://${domain}/${slug}`;
  }
  return `https://${domain}`;
})();

type Message = { role: "user" | "assistant"; content: string };
type Stage = "chat" | "post-answer" | "email-form" | "email-sent";

const WELCOME: Message = {
  role: "assistant",
  content: "Hej! Jag är SharpTrackers support-AI. Vad kan jag hjälpa dig med?",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>("chat");
  const [emailFrom, setEmailFrom] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && stage === "chat") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, stage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, stage]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter(m => m.role !== "assistant" || m !== WELCOME) }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? "Kunde inte svara just nu." }]);
      setStage("post-answer");
    } catch {
      setMessages([...next, { role: "assistant", content: "Något gick fel. Försök igen." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([WELCOME]);
    setStage("chat");
    setInput("");
    setEmailFrom("");
    setEmailMsg("");
    setEmailError("");
  };

  const sendEmail = async () => {
    if (!emailFrom.trim() || !emailMsg.trim()) return;
    setEmailSending(true);
    setEmailError("");
    try {
      const res = await fetch(`${API_BASE}/api/chat/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: emailFrom.trim(), message: emailMsg.trim() }),
      });
      if (!res.ok) throw new Error();
      setStage("email-sent");
    } catch {
      setEmailError("Kunde inte skicka meddelandet. Försök igen.");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-background shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
        style={{ background: "hsl(186 100% 50%)", color: "#0a0a10" }}
        aria-label="Öppna support-chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[520px] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            style={{ background: "hsl(240 5% 8%)", border: "1px solid hsl(240 5% 16%)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "hsl(240 5% 14%)", background: "hsl(240 5% 6%)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "hsl(186 100% 50%)", color: "#0a0a10" }}>
                ST
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white leading-none">SharpTracker Support</p>
                <p className="text-[10px] mt-0.5" style={{ color: "hsl(240 5% 55%)" }}>AI-driven • svarar direkt</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                    style={
                      m.role === "user"
                        ? { background: "hsl(186 100% 50%)", color: "#0a0a10", fontWeight: 500 }
                        : { background: "hsl(240 5% 14%)", color: "hsl(240 5% 85%)" }
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-2.5 text-sm" style={{ background: "hsl(240 5% 14%)" }}>
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "hsl(186 100% 50%)", animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "hsl(186 100% 50%)", animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "hsl(186 100% 50%)", animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}

              {/* Post-answer options */}
              {stage === "post-answer" && !loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-1">
                  <p className="text-xs text-center" style={{ color: "hsl(240 5% 55%)" }}>Löste det sig?</p>
                  <button
                    onClick={() => setStage("chat")}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-left transition-colors"
                    style={{ background: "hsl(240 5% 14%)", color: "hsl(240 5% 80%)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "hsl(240 5% 18%)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "hsl(240 5% 14%)")}
                  >
                    <RefreshCw className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(186 100% 50%)" }} />
                    Ställ en ny fråga
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                  </button>
                  <button
                    onClick={() => setStage("email-form")}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-left transition-colors"
                    style={{ background: "hsl(240 5% 14%)", color: "hsl(240 5% 80%)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "hsl(240 5% 18%)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "hsl(240 5% 14%)")}
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(186 100% 50%)" }} />
                    Maila oss
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                  </button>
                </motion.div>
              )}

              {/* Email form */}
              {stage === "email-form" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5 pt-1">
                  <p className="text-xs font-medium" style={{ color: "hsl(240 5% 65%)" }}>Skicka meddelande till oss</p>
                  <input
                    type="email"
                    placeholder="Din e-postadress"
                    value={emailFrom}
                    onChange={e => setEmailFrom(e.target.value)}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none placeholder:opacity-40"
                    style={{ background: "hsl(240 5% 14%)", color: "white", border: "1px solid hsl(240 5% 20%)" }}
                  />
                  <textarea
                    placeholder="Ditt meddelande…"
                    value={emailMsg}
                    onChange={e => setEmailMsg(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none placeholder:opacity-40 resize-none"
                    style={{ background: "hsl(240 5% 14%)", color: "white", border: "1px solid hsl(240 5% 20%)" }}
                  />
                  {emailError && <p className="text-[11px]" style={{ color: "#f87171" }}>{emailError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStage("post-answer")}
                      className="flex-1 rounded-xl py-2 text-sm transition-colors"
                      style={{ background: "hsl(240 5% 14%)", color: "hsl(240 5% 60%)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "hsl(240 5% 18%)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "hsl(240 5% 14%)")}
                    >
                      Tillbaka
                    </button>
                    <button
                      onClick={sendEmail}
                      disabled={emailSending || !emailFrom.trim() || !emailMsg.trim()}
                      className="flex-[2] rounded-xl py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-40"
                      style={{ background: "hsl(186 100% 50%)", color: "#0a0a10" }}
                    >
                      {emailSending ? "Skickar…" : <><Send className="w-3.5 h-3.5" />Skicka</>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Email sent */}
              {stage === "email-sent" && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto" style={{ background: "hsl(142 71% 45% / 0.15)" }}>
                    <Mail className="w-5 h-5" style={{ color: "#4ade80" }} />
                  </div>
                  <p className="text-sm font-medium text-white">Meddelandet skickat!</p>
                  <p className="text-xs" style={{ color: "hsl(240 5% 55%)" }}>Vi svarar inom kort.</p>
                  <button onClick={reset} className="text-xs underline mt-1" style={{ color: "hsl(186 100% 50%)" }}>
                    Tillbaka till chatten
                  </button>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area — only shown when in chat stage */}
            {(stage === "chat" || (stage === "post-answer" && false)) && stage === "chat" && (
              <div className="px-3 py-3 border-t" style={{ borderColor: "hsl(240 5% 14%)" }}>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "hsl(240 5% 14%)", border: "1px solid hsl(240 5% 20%)" }}>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    disabled={loading}
                    placeholder="Skriv din fråga…"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
                    style={{ color: "white" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-opacity disabled:opacity-30"
                    style={{ background: "hsl(186 100% 50%)", color: "#0a0a10" }}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
