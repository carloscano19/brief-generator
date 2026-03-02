export const KEYWORD_EXPANSION_PROMPT = `You are an elite SEO and GEO (Generative Engine Optimization) strategist. Your goal is to map the entire search and conversational landscape for an article titled '{TITLE}' in {LANGUAGE}.

CRITICAL LOGIC & RELEVANCE:
- Use "Common Sense": Every keyword must have a direct, logical connection to the specific topic of the title.
- Priority: You MUST include all user-provided seed keywords in the output: {SEED_KEYWORDS}
- Goal: Create a cohesive topical map that an LLM would recognize as authoritative. Avoid generic or disconnected terms.

TITLE DECOMPOSITION (MANDATORY):
Before generating keywords, mentally break the title into its key concepts and distinctive terms. Each significant word or phrase from the title MUST appear in at least one keyword proposal — either standalone or as part of a longer phrase. For example, if the title is 'Fan Tokens and the Rise of Crypto-Based Loyalty Programs', then 'rise', 'fan tokens', 'crypto-based', and 'loyalty programs' should each appear in at least one keyword variation (e.g., 'rise of fan tokens', 'crypto loyalty rise', 'fan token growth and rise'). Do NOT ignore any distinctive term from the title — these are what the user chose to write about and must be reflected in the keyword landscape.

GEO STRATEGY — TOPIC DOMINANCE & CITABILITY:
Think about how LLMs decide what to cite. Keywords should target:
- ENTITY UNDERSTANDING: Terms that define who/what the article covers and how it connects to other concepts in the field.
- TOPIC DOMINANCE: Terms that build a complete thematic cluster — definition, comparisons, history, mechanisms, use cases — so the LLM considers this a reference source for the entire domain.
- RESPONSE FIT: Exact phrases users type or ask LLMs, so the article enters the grounding pool for those queries.
- FACT DENSITY: Data-oriented terms (metrics, statistics, comparisons) that signal citable, information-rich content.

Generate EXACTLY 40 unique keyword proposals (10 per category) applying a deep "Thematic Expansion" logic:

1. SEMANTIC (10): Focus on LSI (Latent Semantic Indexing) and specialized entities. Build upon the seeds to find technical, adjacent, and "topical authority" terms that an expert article MUST cover to show deep knowledge. Include terms that reinforce Entity Understanding and Source Authority for LLMs.
2. SYNONYMS & VARIANTS (10): Natural language variations, industry jargon, and different grammatical forms. Include variations of the seeds and title concepts that users actually search for. Consider how different AI engines phrase the same concept.
3. HIGH VOLUME (10): Broad, competitive terms that drive traffic. Head and mid-tail terms that define the core of the topic, even if they overlap with the title's main keywords. Include terms that trigger both traditional search and AI-generated responses.
4. LLM / GEO LONG TAIL (10): Conversational queries and "Zero-Click" intents for LLMs. Include both SHORT-FORM GROUNDING queries (direct fact questions: 'What is X?', 'How much does Y cost?') and LONG-FORM GROUNDING queries (process/comparison questions: 'How does X work?', 'Which is better, X or Y?'). These should reflect real problems users ask AI models to solve.

For each keyword include:
- TEXT: The specific keyword or phrase.
- GROUP: 'semantic', 'synonyms', 'volume', or 'llm'.
- VOLUME: 'low' (<500), 'medium' (500-2000), or 'high' (>2000) based on typical industry demand for this niche.
- RATIONALE: A 1-sentence technical explanation of WHY this term is vital for SEO/GEO authority.

Response Format:
Respond ONLY with valid JSON following this schema: {"keywords": [{"text": "", "group": "semantic|synonyms|volume|llm", "volume": "low|medium|high", "rationale": ""}]}

IMPORTANT:
- Language: {LANGUAGE}.
- Return EXACTLY 40 keywords.
- No markdown, no backticks, no text before or after the JSON.`;

export const BRIEF_GENERATION_PROMPT = `You are an expert in SEO, GEO (Generative Engine Optimization), and editorial content strategy — updated with the GEO 2026 framework. Generate a complete and detailed content brief for the following article:

ARTICLE DATA:
- Title: {TITLE}
- Language: {LANGUAGE}
- Selected keywords: {SELECTED_KEYWORDS}

STRATEGIC GOAL: Maximize citability across ALL major AI engines (ChatGPT, Gemini, Perplexity, Copilot, Claude) by applying the complete GEO 2026 framework.

CRITICAL RULE — H1 / TITLE:
The title provided above ('{TITLE}') IS the definitive H1 of the article. It has been chosen by the user and MUST NOT be changed, rephrased, or replaced. The Article Structure section must use this exact title as the H1. All other headings (H2s, H3s) must complement and support this H1.

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
Complete heading scheme with instructions for each section. The structure should follow the GEO 2026 optimized template:
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

export const SEED_KEYWORD_SUGGESTION_PROMPT = `You are an elite SEO and GEO (Generative Engine Optimization) strategist. Your task is to provide a comprehensive set of "seed keywords" based on the article title "{TITLE}". These seeds will be used as a starting point for further keyword expansion.

GEO CONTEXT: These seed keywords should help the article pass the LLM citability filters — especially Entity Understanding, Response Fit Score, and Semantic Alignment. Think about what terms an AI model searches for during its grounding process.

Generate exactly 20 unique seed keywords, organized into 4 logical categories (5 per category):

1. SHORT (5): 1-2 word broad terms that define the core topic and establish Entity Understanding. These should be the essential concepts an LLM associates with this domain.
2. LONG (5): Specific 3+ word phrases with higher specificity. Include terms that serve both short-form grounding (direct fact lookups) and long-form grounding (detailed process queries).
3. QUESTIONS (5): Clear search intents in question format. Mix direct fact questions (short-form grounding: 'What is X?', 'How much does Y cost?') with process/comparison questions (long-form grounding: 'How does X work?', 'Which is better?'). These are perfect for GEO because they match what users ask AI models.
4. ENTITIES (5): Related entities, technical terms, or specific concepts that MUST be mentioned to demonstrate topical authority and activate Primary Source Detection. Include entities that connect to the topic's Knowledge Graph neighborhood.

Requirements:
- All keywords must be in {LANGUAGE}.
- TITLE DECOMPOSITION: Break the title into its key concepts. Each significant or distinctive word from the title (verbs, nouns, modifiers) MUST appear in at least one seed keyword. For example, if the title contains 'Rise', one seed should include 'rise' (e.g., 'rise of fan tokens'). Never ignore key title terms.
- Focus on specialized value and thematic depth. It is okay to use words from the title if they are part of a more specific or highly relevant search term.
- Use the perspective of what a user would actually type or ask an AI to get expert information.
- Provide a mix of extremely relevant head terms and specific niche variants.
- Think about Topic Dominance: these seeds should collectively cover the complete thematic cluster around the title.

Response Format:
Respond ONLY with a valid JSON object with the following structure:
{
  "short": ["kw1", "kw2", ...],
  "long": ["kw1", "kw2", ...],
  "questions": ["kw1", "kw2", ...],
  "entities": ["kw1", "kw2", ...]
}

IMPORTANT: No markdown, no backticks, no text before or after the JSON.`;

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

export function buildBriefPrompt(
    title: string,
    language: string,
    selectedKeywords: string[]
): string {
    return BRIEF_GENERATION_PROMPT
        .replace('{TITLE}', title)
        .replace(/{LANGUAGE}/g, language)
        .replace('{SELECTED_KEYWORDS}', selectedKeywords.join(', '));
}
