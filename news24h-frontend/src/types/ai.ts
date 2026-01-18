export type AiSummaryResponse = {
  bullets: string[];
};

export type AiChatMessage = {
  role: "user" | "model";
  text: string;
};

export type AiChatResponse = {
  reply: string;
};
