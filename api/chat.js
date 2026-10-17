
const API_URL = "https://radha-mu.vercel.app/api/chat";

async function getRadhaReply(message, history = []) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      history
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "RADHA could not reply.");
  }

  return data.reply;
}
