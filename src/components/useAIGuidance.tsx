export type AmazonLink = {
  searchQuery: string;
  url: string;
  category: string;
  purpose: string;
  redFlags?: string;
};

export type AIGuidance = {
  summary: string;
  disclaimers: string[];
  amazonLinks: AmazonLink[];
};

export function useAIGuidance() {
  const ask = async (message: string) => {
    const res = await fetch("/api/ai/guidance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.message || "AI request failed");
    return data as AIGuidance;
  };

  return { ask };
}