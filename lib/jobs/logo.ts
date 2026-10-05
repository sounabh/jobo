interface ClearbitSuggestion {
  name: string;
  domain: string;
}

/**
 * Real company logo from just a company name, via two free, keyless,
 * no-card services:
 *  1. Clearbit's anonymous Autocomplete API — name -> domain (still live;
 *     its `logo` field was discontinued, so only `domain` is used).
 *  2. Hunter.io's free Logo API — domain -> actual logo image.
 * Returns null on any failure so the caller keeps its existing fallback.
 */
export async function resolveCompanyLogo(companyName: string | null): Promise<string | null> {
  if (!companyName) return null;
  try {
    const res = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(companyName)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const suggestions = (await res.json()) as ClearbitSuggestion[];
    const domain = suggestions[0]?.domain;
    return domain ? `https://logos.hunter.io/${domain}` : null;
  } catch {
    return null;
  }
}