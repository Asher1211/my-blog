import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
  baseURL: "https://api.deepseek.com/v1",
});

export async function streamChat(params: {
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  onChunk: (text: string) => void;
}) {
  const stream = await client.chat.completions.create({
    model: "deepseek-chat",
    stream: true,
    max_tokens: 2048,
    temperature: 0.7,
    messages: [
      { role: "system", content: params.systemPrompt },
      ...params.messages,
    ],
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) params.onChunk(delta);
  }
}

export async function chat(params: {
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<string> {
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 2048,
    temperature: 0.7,
    messages: [
      { role: "system", content: params.systemPrompt },
      ...params.messages,
    ],
  });

  return response.choices[0]?.message?.content || "";
}
