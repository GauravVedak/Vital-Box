export type AmazonLink = {
  searchQuery: string;
  url: string;
  category: "protein" | "preworkout" | "recovery" | "wellness" | "fat-loss";
  purpose: string;
  redFlags?: string;
};

export type AIGuidance = {
  summary: string;
  disclaimers: string[];
  amazonLinks: AmazonLink[];
};
