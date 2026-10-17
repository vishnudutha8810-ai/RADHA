
export default async function handler(req, res) {
  const allowedOrigin =
    "https://vishnudutha8810-ai.github.io";

  // CORS headers for the RADHA GitHub Pages website
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "no-store");

  // Handle browser preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only allow POST requests for chat
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const body = req.body || {};
    const message = body.message;
    const history = body.history || [];

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "Message is too long."
      });
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({
        error: "Invalid chat history."
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is not configured.");

      return res.status(500).json({
        error: "Server API key is missing. Check Vercel Environment Variables."
      });
    }

    const safeHistory = history
      .filter(item =>
        item &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string"
      )
      .slice(-10)
      .map(item => ({
        role: item.role,
        content: item.content.slice(0, 4000)
      }));

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            "https://vishnudutha8810-ai.github.io/RADHA/",
          "X-OpenRouter-Title": "RADHA AI"
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3.5-lightning:free",
          messages: [
            {
              role: "system",
              content:
                "You are RADHA, a helpful and friendly AI assistant. " +
                "Answer clearly and naturally. Be honest about your limitations."
            },
            ...safeHistory,
            {
              role: "user",
              content: message.trim().slice(0, 4000)
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Log provider errors without logging the secret API key
      console.error(
        "OpenRouter request failed:",
        response.status,
        data.error?.message || "Unknown provider error"
      );

      return res.status(502).json({
        error:
          data.error?.message ||
          "The AI provider could not complete the request."
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({
        error: "The AI provider returned an empty reply."
      });
    }

    return res.status(200).json({
      reply: reply.trim()
    });

  } catch (error) {
    console.error("RADHA backend error:", error.message);

    return res.status(500).json({
      error: "RADHA backend error. Please try again."
    });
  }
                }
