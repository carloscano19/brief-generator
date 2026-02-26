export const KEYWORD_EXPANSION_PROMPT = `You are an expert in SEO and GEO (Generative Engine Optimization). Your task is to expand a list of seed keywords for an article titled '{TITLE}' written in {LANGUAGE}.

From the following seed keywords: {SEED_KEYWORDS}

Generate exactly between 15 and 20 keyword proposals organized in 4 groups:
1. SEMANTIC (4-5): keywords from the same semantic field and thematic domain.
2. SYNONYMS AND VARIANTS (3-4): alternative forms, plurals, morphological variants.
3. HIGH VOLUME (3-4): terms with high estimated demand, head or mid-tail.
4. LLM / LONG TAIL (4-6): conversational questions that users ask to ChatGPT, Perplexity, or Google Gemini. Must be in question format reflecting conversational intent.

For each keyword include: keyword text, group, estimated monthly volume (low <500, medium 500-2000, high >2000), and 1 sentence rationale.
Respond in JSON with the schema: {"keywords": [{"text": "", "group": "semantic|synonyms|volume|llm", "volume": "low|medium|high", "rationale": ""}]}
IMPORTANT: Respond ONLY with valid JSON. No markdown, no backticks, no explanations before or after.
Generate all keywords in the language: {LANGUAGE}.`;

export const BRIEF_GENERATION_PROMPT = `You are an expert in SEO, GEO, and editorial content strategy. Generate a complete and detailed content brief for the following article:

ARTICLE DATA:
- Title: {TITLE}
- Language: {LANGUAGE}
- Selected keywords: {SELECTED_KEYWORDS}

GEO CONTEXT — THE 7 PILLARS THE BRIEF MUST APPLY:
Pillar 1 — Question Headline: The H1 must be a direct question that a user would ask an LLM.
Pillar 2 — Power Lead: The first 150 characters must include a specific data point + context + source.
Pillar 3 — Visible Date: Indicate format 'Published: DD Month YYYY, HH:MM UTC'.
Pillar 4 — Verifiable Sources: Each data point must be cited as (Source, Month Year).
Pillar 5 — Expert Author with Credentials: Byline with name, role, years of experience, and profiles.
Pillar 6 — Question-based H2 every 300-400 words with direct answer in ≤60 words.
Pillar 7 — Comparison Tables: At least 1 table with structured data.

Generate the complete brief with ALL of the following sections in this exact order:

## Post Objective
3-5 sentences defining: what the article must explain, what questions it must answer, and what the LLM citability goal is.

## Target Audience
List of 3-5 audience profiles with description of their knowledge level and reading motivation.

## Tone & Style
Specific editorial tone guidelines: formal/informal, technical/general audience, use of analogies, sector jargon level. Include the 60-word rule for H2s.

## Keywords Table
Table with ALL selected keywords organized by group, with estimated volume and usage notes.
| Keyword | Group | Est. Volume | Usage Notes |
|---------|-------|-------------|-------------|

## LLM Optimization Notes
Specific GEO instructions based on the 7 pillars: analogies, cause-effect structure, citable lines, transitions that answer implicit questions, short declarative paragraphs.

## Article Structure
Complete heading scheme with instructions for each section:
| Level | Proposed Heading | Content Instructions | GEO Rule Applied |
|-------|-----------------|---------------------|-----------------|
Include: H1, Intro (Power Lead), Date/Author, 4-6 H2s in question format, and Conclusion.

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
