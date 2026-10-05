export interface ExaSearchResult {
  title: string;
  url: string;
  publishedDate?: string;
  score?: number;
  image?: string;
  favicon?: string;
  highlights?: string[];
  text?: string;
}

interface ExaSearchResponse {
  results?: ExaSearchResult[];
}

export interface ExaSearchParams {
  query: string;
  numResults?: number;
  includeDomains?: string[];
}

export async function exaSearch({
  query,
  numResults = 15,
  includeDomains,
}: ExaSearchParams): Promise<ExaSearchResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error("EXA_API_KEY is missing. Add it to .env.local and restart the dev server.");
  }

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query,
      numResults,
      type: "auto",
      includeDomains,
      contents: {
        text: { maxCharacters: 3000 }, // enough for solid field extraction
        highlights: { numSentences: 3 }, // cheap, AI-selected key excerpts
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Exa Search API error ${response.status}: ${body || response.statusText}`);
  }

  const data = (await response.json()) as ExaSearchResponse;
  return data.results ?? [];
}