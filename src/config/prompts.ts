export const KEYWORD_EXPANSION_PROMPT = `You are an elite SEO and GEO (Generative Engine Optimization) strategist. Your goal is to map the entire search and conversational landscape for an article titled '{TITLE}' in {LANGUAGE}.

Using the seed keywords as a starting point: {SEED_KEYWORDS}

Generate EXACTLY 40 unique keyword proposals (10 per category) applying a deep "Topic Coverage" logic:

1. SEMANTIC (10): Focus on LSI (Latent Semantic Indexing) and related entities. Don't just repeat seeds; find the technical, adjacent, and "topical authority" terms that an expert article MUST cover.
2. SYNONYMS & VARIANTS (10): Natural language variations, common industry jargon, different grammatical forms (search intent remains the same but wording changes).
3. HIGH VOLUME (10): Broad, highly competitive terms that drive traffic. Head and mid-tail terms that define the category.
4. LLM / GEO LONG TAIL (10): Conversational questions, "Zero-Click" intents, and trigger phrases for LLMs (ChatGPT, Gemini, Perplexity). Format as specific questions or complex long-tail prompts reflecting deep user intent.

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

export const SEED_KEYWORD_SUGGESTION_PROMPT = `You are an SEO expert. Based on the article title "{TITLE}", suggest 6-8 relevant "seed keywords" that would be the best starting point for a deep topical expansion.

Requirements:
- Mix of short-tail (1-2 words) and long-tail (3+ words/questions) terms.
- Directly related to the title's intent.
- Language: {LANGUAGE}.

Response Format:
Respond ONLY with a JSON array of strings: ["keyword1", "keyword2", ...]
No markdown, no backticks, no text before or after the JSON.`;

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
