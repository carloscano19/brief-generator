export const KEYWORD_EXPANSION_PROMPT = `You are an elite SEO and GEO (Generative Engine Optimization) strategist. Your goal is to map the entire search and conversational landscape for an article titled '{TITLE}' in {LANGUAGE}.

CRITICAL LOGIC & RELEVANCE:
- Use "Common Sense": Every keyword must have a direct, logical connection to the specific topic of the title.
- Priority: You MUST include all user-provided seed keywords in the output: {SEED_KEYWORDS}
- Goal: Create a cohesive topical map that an LLM would recognize as authoritative. Avoid generic or disconnected terms.

Generate EXACTLY 40 unique keyword proposals (10 per category) applying a deep "Thematic Expansion" logic:

1. SEMANTIC (10): Focus on LSI (Latent Semantic Indexing) and specialized entities. Build upon the seeds to find technical, adjacent, and "topical authority" terms that an expert article MUST cover to show deep knowledge.
2. SYNONYMS & VARIANTS (10): Natural language variations, industry jargon, and different grammatical forms. Include variations of the seeds and title concepts that users actually search for.
3. HIGH VOLUME (10): Broad, competitive terms that drive traffic. Head and mid-tail terms that define the core of the topic, even if they overlap with the title's main keywords.
4. LLM / GEO LONG TAIL (10): Conversational queries and "Zero-Click" intents for LLMs. Expand the seeds into specific questions or complex prompts reflecting real user problems.

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

export const BRIEF_GENERATION_PROMPT = `You are an expert in SEO, GEO, and editorial content strategy. Generate a complete and detailed content brief for the following article:

ARTICLE DATA:
- Title: {TITLE}
- Language: {LANGUAGE}
- Selected keywords: {SELECTED_KEYWORDS}

STRATEGIC GOAL: Maximize positioning in LLMs (ChatGPT, Gemini, Perplexity) via GEO (Generative Engine Optimization).

GEO CONTEXT — THE 7 PILLARS THE BRIEF MUST APPLY:
Pillar 1 — Question Headline: The H1 must be a direct question that a user would ask an LLM. It must look natural and citable.
Pillar 2 — Power Lead: The first 150 characters must include a specific data point + context + source.
Pillar 3 — Visible Date: Indicate format 'Published: DD Month YYYY, HH:MM UTC'.
Pillar 4 — Verifiable Sources: Each data point must be cited as (Source, Month Year).
Pillar 5 — Expert Author with Credentials: Byline with name, role, years of experience, and profiles.
Pillar 6 — Question-based H2 every 300-400 words with direct answer in ≤60 words. HEADINGS MUST FLOW LOGICALLY and integration of keywords must feel natural, not forced.
Pillar 7 — Comparison Tables: At least 1 table with structured data.

Generate the complete brief with ALL of the following sections in this exact order:

## Post Objective
3-5 sentences defining: what the article must explain, what questions it must answer, and what the LLM citability goal is.

## Target Audience
List of 3-5 audience profiles with description of their knowledge level and reading motivation.

## Tone & Style
Specific editorial tone guidelines: formal/informal, technical/general audience, use of analogies, sector jargon level. Include the 60-word rule for H2s. Focus on clarity and authority.

## Keywords Table
Table with ALL selected keywords organized by group, with estimated volume and usage notes.
| Keyword | Group | Est. Volume | Usage Notes |
|---------|-------|-------------|-------------|

## LLM Optimization Notes
Specific GEO instructions based on the 7 pillars: how to use the selected keywords to answer implicit LLM questions, cause-effect structure, and citable lines.

## Article Structure
Complete heading scheme with instructions for each section. IMPORTANT: The headings must follow a logical narrative and represent a high-authority answer to the user's intent.
| Level | Proposed Heading | Content Instructions | GEO Rule Applied |
|-------|-----------------|---------------------|-----------------|
Include: H1 (Question), Intro (Power Lead), Date/Author, 4-6 H2s (Questions), and Conclusion.

## Pre-Publication GEO Checklist
The 10 GEO/LLM pillar criteria checklist:
- [ ] Headline is a direct question a user would ask ChatGPT or Google
- [ ] First 150 characters include: % or numeric data + price/volume + source
- [ ] Date is visible: 'Published: DD Month YYYY, HH:MM UTC'
- [ ] Every data point has verifiable source cited as (Source, Month Year)
- [ ] Byline includes: full name + role/specialization + profile links
- [ ] There is an H2 in question format every 300-400 words
- [ ] After each H2 there is a direct answer of ≤60 words
- [ ] There is at least 1 comparison table with structured data
- [ ] Entity/token names use format: Full Name (SYMBOL)
- [ ] The article mentions the event/context that justifies it

## 8 Deadly Errors to Avoid
1. Generic headline without a question
2. Intro with filler text and no concrete data
3. Data without verifiable source
4. Empty marketing language ('revolutionary', 'incredible', 'the best')
5. Long paragraphs without structure (500+ word blocks)
6. Anonymous or generic author
7. Comparisons in paragraph instead of table
8. Not linking content to a real event or context

Respond in {LANGUAGE}. Use Markdown format.`;

export const SEED_KEYWORD_SUGGESTION_PROMPT = `You are an elite SEO strategist. Your task is to provide a comprehensive set of "seed keywords" based on the article title "{TITLE}". These seeds will be used as a starting point for further expansion.

Generate exactly 20 unique seed keywords, organized into 4 logical categories (5 per category):

1. SHORT (5): 1-2 word broad terms that define the core topic.
2. LONG (5): Specific 3+ word phrases with higher specificity.
3. QUESTIONS (5): Clear search intents in question format (perfect for GEO/LLMs).
4. ENTITIES (5): Related entities, technical terms, or specific concepts that MUST be mentioned.

Requirements:
- All keywords must be in {LANGUAGE}.
- Focus on specialized value and thematic depth. It is okay to use words from the title if they are part of a more specific or highly relevant search term.
- Use the perspective of what a user would actually type or ask an AI to get expert information.
- Provide a mix of extremely relevant head terms and specific niche variants.

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
