export function validateApiKey(key: string, prefix: string): boolean {
    if (!key || key.length < 10) return false;
    if (prefix && !key.startsWith(prefix)) {
        // OpenAI keys can start with sk- or sk-proj-
        if (prefix === 'sk-' && key.startsWith('sk-')) return true;
        if (prefix === 'sk-ant-' && key.startsWith('sk-ant-')) return true;
        if (prefix === 'AIza' && key.startsWith('AIza')) return true;
        return false;
    }
    return true;
}

export function sanitizeInput(input: string, maxLength: number = 500): string {
    return input
        .replace(/```/g, '')
        .replace(/"""/g, '')
        .trim()
        .slice(0, maxLength);
}
