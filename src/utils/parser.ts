import type { KeywordProposal } from '../types';

export function parseKeywordResponse(raw: string): KeywordProposal[] {
    // Strip markdown code fences if present
    let cleaned = raw.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/i, '');

    // Try to extract JSON object if there's surrounding text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleaned = jsonMatch[0];
    }

    try {
        const parsed = JSON.parse(cleaned);
        const keywords = parsed.keywords || parsed;

        if (!Array.isArray(keywords)) {
            throw new Error('Expected array of keywords');
        }

        return keywords.map((kw: Record<string, string>) => ({
            text: kw.text || kw.keyword || '',
            group: normalizeGroup(kw.group || kw.category || ''),
            volume: normalizeVolume(kw.volume || kw.estimated_volume || 'medium'),
            rationale: kw.rationale || kw.justification || kw.reason || '',
            selected: false,
        }));
    } catch {
        throw new Error('Failed to parse keyword response as JSON');
    }
}

function normalizeGroup(group: string): KeywordProposal['group'] {
    const g = group.toLowerCase();
    if (g.includes('semant') || g === 'semantic') return 'semantic';
    if (g.includes('synon') || g.includes('variant') || g === 'synonyms') return 'synonyms';
    if (g.includes('volum') || g.includes('volume') || g === 'high volume') return 'volume';
    if (g.includes('llm') || g.includes('long') || g.includes('tail')) return 'llm';
    return 'semantic';
}

function normalizeVolume(volume: string): 'low' | 'medium' | 'high' {
    const v = volume.toLowerCase();
    if (v.includes('low') || v.includes('bajo')) return 'low';
    if (v.includes('high') || v.includes('alto')) return 'high';
    return 'medium';
}
