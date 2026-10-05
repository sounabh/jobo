export interface TavilySearchResult {
  title: string;
  url: string;
  content?: string;
  score?: number;
  favicon?: string;
}

interface TavilySearchResponse {
  results?: TavilySearchResult[];
}

export interface TavilySearchParams {
  query: string;
  maxResults?: number;
  includeDomains?: string[];
}

export async function tavilySearch({
  query,
  maxResults = 15,
  includeDomains,
}: TavilySearchParams): Promise<TavilySearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is missing. Add it to .env.local and restart the dev server.");

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      query,
      max_results: maxResults,
      search_depth: "advanced",
      include_domains: includeDomains,
      include_favicon: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Tavily Search API error ${response.status}: ${body || response.statusText}`);
  }

  const data = (await response.json()) as TavilySearchResponse;
  return data.results ?? [];
}

export interface TavilyExtractResult {
  url: string;
  raw_content?: string;
}

interface TavilyExtractResponse {
  results?: TavilyExtractResult[];
}

/**
 * Pulls full page content for a batch of URLs — used after search+dedupe
 * so field extraction works against the real job description instead of
 * a 1-2 line search snippet.
 */
export async function tavilyExtract(urls: string[]): Promise<TavilyExtractResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is missing. Add it to .env.local and restart the dev server.");
  if (urls.length === 0) return [];

  const response = await fetch("https://api.tavily.com/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ urls, extract_depth: "basic" }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Tavily Extract API error ${response.status}: ${body || response.statusText}`);
  }

  const data = (await response.json()) as TavilyExtractResponse;
  return data.results ?? [];
}