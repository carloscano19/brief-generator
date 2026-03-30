import type { AhrefsKeywordData, AhrefsSerpInsight } from '../types';

const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const PROXY = isLocal ? 'https://corsproxy.io/?url=' : '/brief-generator/ahrefs-proxy.php?url=';
const AHREFS_BASE = 'https://api.ahrefs.com/v3';

function proxied(url: string): string {
    return `${PROXY}${encodeURIComponent(url)}`;
}

async function ahrefsFetch(apiKey: string, url: string): Promise<unknown> {
    const res = await fetch(proxied(url), {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
        },
    });

    if (res.status === 401 || res.status === 403) {
        throw new AhrefsAuthError('Invalid Ahrefs API Key or insufficient credits.');
    }
    if (!res.ok) {
        throw new Error(`Ahrefs API error: ${res.status}`);
    }
    return res.json();
}

export class AhrefsAuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AhrefsAuthError';
    }
}

// ─── Keyword Metrics ───────────────────────────────────────────────────────────
// Fetches SV and KD for an array of keywords using the keywords_explorer/overview endpoint.
// Returns a map keyed by keyword text.
export async function fetchKeywordMetrics(
    apiKey: string,
    keywords: string[],
    country = 'us'
): Promise<Record<string, AhrefsKeywordData>> {
    const result: Record<string, AhrefsKeywordData> = {};

    // Ahrefs v3 accepts a comma-separated list of keywords. 
    // We batch requests up to 50 keywords at once to heavily reduce API hits.
    const batchSize = 50;
    for (let i = 0; i < keywords.length; i += batchSize) {
        const batch = keywords.slice(i, i + batchSize);
        try {
            const url = `${AHREFS_BASE}/keywords-explorer/overview?keywords=${encodeURIComponent(batch.join(','))}&country=${country}&select=keyword,volume,difficulty&_cb=${Date.now()}`;
            const data = await ahrefsFetch(apiKey, url) as {
                keywords?: Array<{ keyword: string; volume: number | null; difficulty: number | null }>;
            };
            
            // pre-fill with nulls in case API omits some
            batch.forEach(kw => { result[kw] = { sv: null, kd: null, country }; });

            if (data?.keywords) {
                data.keywords.forEach(entry => {
                    result[entry.keyword] = {
                        sv: entry.volume ?? null,
                        kd: entry.difficulty ?? null,
                        country,
                    };
                });
            }
        } catch (err) {
            if (err instanceof AhrefsAuthError) throw err; // propagate auth errors
            console.error(`Ahrefs fetchKeywordMetrics failed for batch`, err);
            batch.forEach(kw => { result[kw] = { sv: null, kd: null, country }; });
        }
    }
    return result;
}

// ─── Related Keywords ──────────────────────────────────────────────────────────
// Fetches Matching, Related, and Search Suggestions for a seed keyword.
export async function fetchRelatedKeywords(
    apiKey: string,
    seed: string,
    country = 'us'
): Promise<{ matching: string[]; related: string[]; suggestions: string[] }> {
    const cb = `&_cb=${Date.now()}`;
    const baseParams = `?keywords=${encodeURIComponent(seed)}&country=${country}&limit=10&select=keyword${cb}`;

    try {
        const [matchingData, relatedData, suggestionsData] = await Promise.all([
            ahrefsFetch(apiKey, `${AHREFS_BASE}/keywords-explorer/matching-terms${baseParams}&order_by=volume%3Adesc`),
            ahrefsFetch(apiKey, `${AHREFS_BASE}/keywords-explorer/related-terms${baseParams}`),
            ahrefsFetch(apiKey, `${AHREFS_BASE}/keywords-explorer/search-suggestions${baseParams}`)
        ]) as [any, any, any];

        const mapKw = (data: any) => (data?.keywords ?? [])
            .map((k: any) => k.keyword)
            .filter((k: string) => k.toLowerCase() !== seed.toLowerCase());

        return {
            matching: mapKw(matchingData),
            related: mapKw(relatedData),
            suggestions: mapKw(suggestionsData),
        };
    } catch (err) {
        if (err instanceof AhrefsAuthError) throw err;
        console.error(`Ahrefs fetchRelatedKeywords failed for: ${seed}`, err);
        return { matching: [], related: [], suggestions: [] };
    }
}

// ─── SERP Overview ─────────────────────────────────────────────────────────────
// Fetches SERP data for a keyword and extracts intent + avg word count from top 3.
export async function fetchSerpInsight(
    apiKey: string,
    keyword: string,
    country = 'us'
): Promise<AhrefsSerpInsight> {
    try {
        const url = `${AHREFS_BASE}/serp-overview/by-keyword?keywords=${encodeURIComponent(keyword)}&country=${country}&select=title,url,word_count,type&_cb=${Date.now()}`;
        const data = await ahrefsFetch(apiKey, url) as {
            serp?: Array<{
                title?: string;
                url?: string;
                word_count?: number | null;
                type?: string;
            }>;
        };

        const top3 = (data?.serp ?? []).slice(0, 3);
        const top3Urls = top3.map((r) => r.url ?? '').filter(Boolean);

        // Calculate average word count
        const wordCounts = top3
            .map((r) => r.word_count)
            .filter((w): w is number => typeof w === 'number' && w > 0);
        const avgWords = wordCounts.length > 0
            ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
            : null;

        // Determine dominant intent from the 'type' field
        const types = top3.map((r) => r.type?.toLowerCase() ?? '');
        const dominantIntent = inferIntent(types);

        return { avgWords, dominantIntent, top3Urls };
    } catch (err) {
        if (err instanceof AhrefsAuthError) throw err;
        return { avgWords: null, dominantIntent: null, top3Urls: [] };
    }
}

function inferIntent(types: string[]): string | null {
    if (types.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const t of types) {
        const normalized = mapType(t);
        counts[normalized] = (counts[normalized] ?? 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? null;
}

function mapType(type: string): string {
    if (type.includes('guide') || type.includes('how') || type.includes('tutorial')) return 'Informative';
    if (type.includes('article') || type.includes('blog') || type.includes('post')) return 'Informative';
    if (type.includes('product') || type.includes('shop') || type.includes('ecommerce')) return 'Transactional';
    if (type.includes('review') || type.includes('comparison') || type.includes('best')) return 'Commercial';
    if (type.includes('news')) return 'News';
    if (type.includes('local')) return 'Local';
    return 'Informative';
}
