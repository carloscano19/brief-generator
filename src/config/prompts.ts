export const KEYWORD_EXPANSION_PROMPT = `You are an elite SEO and GEO (Generative Engine Optimization) strategist. Your goal is to map the entire search and conversational landscape for an article titled '{TITLE}' in {LANGUAGE}.

CRITICAL LOGIC & RELEVANCE:
- Use "Common Sense": Every keyword must have a direct, logical connection to the specific topic of the title.
- Priority: You MUST include all user-provided seed keywords in the output: {SEED_KEYWORDS}
- Goal: Create a cohesive topical map that an LLM would recognize as authoritative. Avoid generic or disconnected terms.

GEO STRATEGY — TOPIC DOMINANCE & CITABILITY:
- ENTITY UNDERSTANDING: Terms that define who/what the article covers.
- TOPIC DOMINANCE: Terms that build a complete thematic cluster (definitions, comparisons, use cases).
- RESPONSE FIT: Exact phrases users ask LLMs ('How does X work?', 'What is the best Y?').
- FACT DENSITY: Data-oriented terms that signal information-rich content.

Generate EXACTLY 40 unique keyword proposals applying a deep "Thematic Expansion" logic. Include a mix of:
1. Core SEO terms (high relevance, entities).
2. Natural language variations and industry jargon.
3. High-volume head terms.
4. Long-tail conversational queries and direct questions for AI grounding.

For each keyword include:
- TEXT: The specific keyword or phrase.
- VOLUME: 'low' (<500), 'medium' (500-2000), or 'high' (>2000) based on typical industry demand.
- RATIONALE: A 1-sentence technical explanation of WHY this term is vital for SEO/GEO authority.

Response Format:
Respond ONLY with valid JSON following this schema: {"keywords": [{"text": "", "volume": "low|medium|high", "rationale": ""}]}

IMPORTANT:
- Language: {LANGUAGE}.
- Return EXACTLY 40 keywords.
- No categories, no groups, just one flat list of keywords.
- No markdown, no backticks, no text before or after the JSON.`;

export const BRIEF_GENERATION_PROMPT = `You are an expert in SEO, GEO (Generative Engine Optimization), and editorial content strategy — updated with the GEO 2026 framework. Generate a complete and detailed content brief for the following article:

ARTICLE DATA:
- Title: {TITLE}
- Language: {LANGUAGE}
{KEYWORD_DATA}

STRATEGIC GOAL: Maximize citability across ALL major AI engines (ChatGPT, Gemini, Perplexity, Copilot, Claude) by applying the complete GEO 2026 framework.

CRITICAL RULE — H1 / TITLE:
The title provided above ('{TITLE}') IS the definitive H1 of the article. It has been chosen by the user and MUST NOT be changed, rephrased, or replaced. The Article Structure section must use this exact title as the H1. All other headings (H2s, H3s) must complement and support this H1.

CRITICAL RULE — PRIMARY TOPIC DOMINANCE (70/30 RULE):
1. THE PRIMARY TOPIC MUST DOMINATE: At least 70% of the H2 headings MUST focus on or explicitly include the Primary Keyword. 
2. NO GENERIC INTROS: Do NOT start with generic H2s like "What is [Topic]?" unless the Primary Keyword IS specifically about defining the topic. 
3. LOGICAL FLOW: The primary topic is the "Golden Thread" that connects every section. Supporting keywords (30%) should only be used to add depth to the primary narrative, never to divert the focus.
4. HEADLINE REQUIREMENT: Every H2 must be a direct question that is highly relevant to the Primary Topic.
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GEO 2026 CONTEXT — THE 15 CITABILITY FILTERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These are the 15 internal filters an LLM applies when deciding whether to cite a source. The brief MUST ensure the final article passes ALL of them:

1. Grounding — The AI searches for external sources to validate its response. Without grounding, there is no citation. The article must be structured so AI agents can crawl and extract information.
2. Validation Signals — Consistent schema, clear text, defined entities, clean URLs all confirm data is real.
3. Source Authority — The LLM's perception that you are the correct source for this topic. Formed by clarity, consistency, and reputation. This is topical trust, not PageRank.
4. Entity Understanding — The AI must know who/what you are and how you connect with other concepts. The article must clearly define and contextualize all entities.
5. Semantic Alignment — The content's language and structure must match the user's real search intent.
6. Content Coherence — The article must not contradict itself or other content on the same site.
7. Schema-Text Matching — What the schema declares must match exactly what appears in the visible text.
8. Freshness Confidence — Updated content with visible dates receives preference. The dateModified field is critical.
9. Primary Source Detection — Original data, proprietary research, or first-hand information multiplies citation probability. This is the single biggest citability multiplier.
10. Contradiction Check — Data must align with the highest authority sources. Contradicting stronger sources means the AI won't cite you.
11. Response Fit Score — The AI calculates whether your content matches the exact intent behind the user's question. A section that directly answers the question enters the grounding pool.
12. Structured Data Confidence — Clean, complete, consistent schema. A schema with errors causes the AI to discard you entirely.
13. Crawlability for LLMs — Content must be visible in raw HTML without JavaScript rendering. Agents have limited rendering budgets.
14. Canonical Stability — Stable URLs and site structure signal a reliable long-term source. LLMs build long-term semantic associations.
15. Fact Density — More relevant facts per paragraph = higher citation probability. AIs prefer information-dense content over pages with commercial filler.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 6 CONTENT PILLARS FOR CITABLE CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pillar 1 — Headline Alignment: The H1 is the user's title (already defined, do not change it). If the title is already in question format, excellent — it maximizes Response Fit Score. If it is not a question, keep it as-is and ensure the H2s underneath are written as questions to compensate. Formulas for H2s: 'Why Did [entity] [action] after [event]?' · 'How Does [mechanism] Work in [context]?' · 'What Is the [metric] of [entity] in [period]?'
Pillar 2 — Power Lead: The first 150 characters must include a specific data point + context + source. Formula: [SPECIFIC DATA: % change, price, volume] + [EVENT/CONTEXT] + [VERIFIABLE SOURCE]. This serves SHORT-FORM GROUNDING (direct fact questions).
Pillar 3 — Visible Date: Format 'Published: [Month] [DD], [YYYY], [HH:MM] UTC · Updated: [date]'. Always update dateModified in schema to signal Freshness Confidence to LLMs.
Pillar 4 — Verifiable Sources: Every data point must be cited as '(Source, Month Year)' directly in the text. Unsupported claims are detected and penalized by LLMs.
Pillar 5 — Question-based H2s + 60-Word Rule: One H2 every 300-400 words written as a real question. After each H2: a direct answer in ≤60 words BEFORE developing the topic. This serves LONG-FORM GROUNDING (process/comparison questions). Headings must flow in a logical narrative.
Pillar 6 — Comparison Tables: At least 1 table with structured data. LLMs process tables significantly better than descriptive paragraphs. Use tables for: comparisons between 3+ entities, time-based evolution, benefits by category, platform comparisons.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTI-ENGINE OPTIMIZATION (2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each AI engine has different priorities:
- Google SGE/Gemini → Factual coherence, correct schema, .gov/.edu sources
- Bing/Copilot → Structure + data: tables, lists, clear H2s
- ChatGPT Search → Clarity + stability: stable, well-written, consistently updated content
- Perplexity → Explicit references: direct citations, named sources, dated data
- Claude → Precision + context: detailed, well-structured, contradiction-free content

A brief that combines: clear Power Lead + tabulated data + validated schema + cited sources + question H2s + visible date → works well across all engines simultaneously.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRIEF OUTPUT — Generate ALL sections below in this exact order:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Post Objective
3-5 sentences defining: what the article must explain, what questions it must answer, and what the LLM citability goal is. Mention which of the 15 citability filters this article is best positioned to activate and why.

## Target Audience
List of 3-5 audience profiles with description of their knowledge level and reading motivation. Include what type of query each audience would use (short-form vs long-form grounding).

## Tone & Style
Specific editorial tone guidelines. Include:
- The 60-word rule for H2s (direct answer before development)
- Fact density requirement (more facts per paragraph, zero commercial filler)
- Source citation format: '[Statement with data]. (Source, Month Year).'
- Focus on clarity and authority — avoid marketing language ('revolutionary', 'incredible', 'the best')

## Keywords Table
Table with ALL selected keywords organized by group, with estimated volume and usage notes.
| Keyword | Group | Est. Volume | Usage Notes |
|---------|-------|-------------|-------------|

## LLM Optimization Notes
Specific GEO 2026 instructions organized by citability filter activation:
- How to structure the Power Lead for short-form grounding (direct facts in ≤60 words)
- How to structure H2 sections for long-form grounding (questions + development + tables)
- Which keywords serve as entity-defining terms vs. response-fit terms
- How to use the selected keywords to activate Primary Source Detection, Semantic Alignment, and Response Fit Score
- Multi-engine strategy: what to emphasize for each major AI engine
- Topic Dominance approach: how this article fits into a broader thematic cluster

## Article Structure
{STRUCTURE_INSTRUCTIONS}
| Level | Proposed Heading | Content Instructions | GEO Citability Filter Activated |
|-------|-----------------|---------------------|---------------------------------|
Include: Intro (Power Lead with data in first 150 chars), Date/Author block, 4-6 H2s (Questions following the 60-word rule), at least 1 comparison table section, and Conclusion. (Note: Do NOT include an H1 row, as the user's title is already the definitive H1).
The headings must follow a logical narrative and represent a high-authority answer to the user's intent.

## Pre-Publication GEO Checklist (12 Criteria)
9 or more = high citation probability. 12/12 = optimized for all AI engines simultaneously.
- [ ] The headline is a direct question a user would ask an AI (ChatGPT, Gemini, Perplexity)
- [ ] First 150 characters include: specific data (% or number) + context + source (Power Lead)
- [ ] Date is visible: 'Published: [Month] [DD], [YYYY], [HH:MM] UTC · Updated: [date]'
- [ ] Every data point has a verifiable source cited: (Source, Month Year)
- [ ] There is one question-based H2 every 300-400 words
- [ ] After each H2 there is a direct answer in ≤60 words before development
- [ ] There is at least 1 comparison table with structured data
- [ ] JSON-LD schema is validated and matches the visible text (Schema-Text Matching)
- [ ] Content is visible in 'View Page Source' without JavaScript (Crawlability for LLMs)
- [ ] Data does not contradict stronger official sources (Contradiction Check)
- [ ] The page URL and structure are stable (Canonical Stability)
- [ ] The content covers the topic in depth, not just one data point (Topic Dominance)

## 8 Deadly Errors That Destroy Citability
1. Generic headline without a question: e.g. 'The Token Market Today' → Use: 'Why Did 5 European Sports Tokens Drop Today?'
2. Filler intro with no concrete data: e.g. 'In the dynamic world of...' → Start with real data from line one
3. Data without a verifiable source: e.g. 'Many analysts predict...' → Cite: 'Per [Source] Q4 report, volume grew 67% (Source, Month Year).'
4. Empty marketing language: e.g. 'revolutionary', 'incredible', 'the best' → Use specific data: 'increased 45%', 'reached 50,000 holders'
5. Long unstructured paragraphs (500+ words): → 100-150 word paragraphs + one H2 every 300 words
6. Schema with errors or that does not match the visible text: → Validate JSON-LD before publishing
7. Comparisons in paragraph instead of table: e.g. 'Token X is $2 while Y is $5...' → Use a comparison table with clear columns
8. Content that contradicts stronger sources (Wikipedia, official sites, .gov): → Review and align with highest authority sources before publishing

Respond in {LANGUAGE}. Use Markdown format.`;

export const SEED_KEYWORD_SUGGESTION_PROMPT = `You are an elite SEO and GEO (Generative Engine Optimization) strategist. Your task is to provide a highly relevant list of "seed keywords" based on the article title "{TITLE}". 

GEO CONTEXT: These seeds should help the article pass LLM citability filters (Entity Understanding, Response Fit, Semantic Alignment). 

Generate EXACTLY 15 unique seed keywords that represent the core thematic cluster of the title. Include a mix of:
1. Essential concepts and entities.
2. Specific niche variations.
3. Common questions users ask AI about this topic.

Requirements:
- All keywords must be in {LANGUAGE}.
- TOPIC RELEVANCE: Every keyword must be strictly related to the title. Avoid generic terms.
- TITLE DECOMPOSITION: Ensure key concepts from the title are reflected in the seeds.
- Perspective: Use terms a user would actually type or ask an AI to find expert info.

Response Format:
Respond ONLY with a valid JSON object:
{
  "seeds": ["kw1", "kw2", "kw3", ...]
}

IMPORTANT: No categories, no markdown, no backticks, no text before or after the JSON.`;

export function buildSeedSuggestionPrompt(
    title: string,
    language: string
): string {
    return SEED_KEYWORD_SUGGESTION_PROMPT
        .replace('{TITLE}', title)
        .replace(/{LANGUAGE}/g, language);
}

export function buildKeywordPrompt(
    title: string,
    language: string,
    seedKeywords: string[]
): string {
    return KEYWORD_EXPANSION_PROMPT
        .replace('{TITLE}', title)
        .replace(/{LANGUAGE}/g, language)
        .replace('{SEED_KEYWORDS}', seedKeywords.join(', '));
}

export function buildBriefPrompt(title: string, language: string, primaryKeyword: string | null, secondaryKeywords: string[]) {
    const keywordData = primaryKeyword
        ? `- PRIMARY KEYWORD (70% weight): "${primaryKeyword}"\n- SUPPORTING KEYWORDS (30% weight): ${secondaryKeywords.length > 0 ? secondaryKeywords.map(k => `"${k}"`).join(', ') : 'None'}`
        : `- SELECTED KEYWORDS: ${secondaryKeywords.join(', ')}`;

    const structureInstructions = primaryKeyword
        ? `STRICT DOMINANCE RULE: The Primary Keyword "${primaryKeyword}" is the anchor. 
1. AT LEAST 4 of the H2 headings MUST explicitly answer questions about or include "${primaryKeyword}".
2. DO NOT waste H2s on generic "What is..." definitions.
3. Every H2 must be a direct question that flows from the H1 titled "${title}" but focuses on the ANGLE of "${primaryKeyword}".`
        : `Complete heading scheme for the title "${title}" using the selected keywords. Focus on a logical narrative.`;

    return BRIEF_GENERATION_PROMPT
        .replace(/{TITLE}/g, title)
        .replace(/{LANGUAGE}/g, language)
        .replace('{KEYWORD_DATA}', keywordData)
        .replace('{STRUCTURE_INSTRUCTIONS}', structureInstructions);
}
