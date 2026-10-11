export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Server API key is not configured"
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vishnudutha8810-ai.github.io/RADHA/",
          "X-OpenRouter-Title": "RADHA AI"
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3.5-lightning:free",
          messages: [
            {
              role: "system",
              content: "You are RADHA, a helpful, friendly AI assistant. Answer clearly and naturally."
            },
            ...history
              .filter(m => ["user", "assistant"].includes(m.role))
              .slice(-10)
              .map(m => ({
                role: m.role,
                content: String(m.content || "").slice(0, 4000)
              })),
            { role: "user", content: message.slice(0, 4000) }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI request failed"
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No reply received."
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
