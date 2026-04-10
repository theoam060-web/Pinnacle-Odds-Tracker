import { Router } from "express";
import OpenAI from "openai";
import { Resend } from "resend";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const SUPPORT_EMAIL = "theoam060@gmail.com";

const SYSTEM_PROMPT = `You are a helpful support assistant for SharpTracker, a real-time sports odds movement tracker for sharp bettors.

You answer questions about SharpTracker concisely and helpfully. Keep answers short (2-4 sentences max).

Key facts about SharpTracker:
- SharpTracker tracks live odds movements from the world's sharpest bookmaker
- When odds drop suddenly it's a signal that sharp money is coming in — SharpTracker alerts you instantly
- There are two plans: Silver (basic alerts) and Gold (all features, bookmaker comparison, push notifications)
- Users can set up alert configurations: choose sport, market type, minimum drop %, odds range, bookmakers to compare
- The app works as a mobile PWA — add to home screen via your browser's share menu
- Push notifications fire on your phone the moment a sharp drop is detected
- The odds feed shows live drops with the percentage change, sport, market, and outcome
- All data is real-time and automatically updated

If a question is outside the scope of SharpTracker, politely say you can only help with SharpTracker-related questions.

Always respond in the same language as the user (Swedish or English).`;

router.post("/api/chat", async (req, res) => {
  const { messages } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 300,
      temperature: 0.6,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
    res.json({ reply });
  } catch (err) {
    console.error("[Chat] OpenAI error:", err);
    res.status(500).json({ error: "AI error" });
  }
});

router.post("/api/chat/email", async (req, res) => {
  const { from, message } = req.body as { from?: string; message?: string };

  if (!from || !message) {
    return res.status(400).json({ error: "from and message are required" });
  }

  if (!resend) {
    console.warn("[Chat] RESEND_API_KEY not set — logging email instead");
    console.log(`[Chat] Email from ${from}: ${message}`);
    return res.json({ ok: true, note: "logged (resend not configured)" });
  }

  try {
    await resend.emails.send({
      from: "SharpTracker Support <onboarding@resend.dev>",
      to: [SUPPORT_EMAIL],
      replyTo: from,
      subject: `SharpTracker customer message from ${from}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #00e5ff; margin-bottom: 8px;">New customer message</h2>
          <p><strong>From:</strong> ${from}</p>
          <hr style="border-color: #333; margin: 16px 0;" />
          <p style="white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          <hr style="border-color: #333; margin: 16px 0;" />
          <p style="font-size: 12px; color: #888;">Sent via SharpTracker chat widget</p>
        </div>
      `,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("[Chat] Resend error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
