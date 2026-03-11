/**
 * Preprocesses a string for HTML rendering.
 * - Decodes HTML entities (e.g., &uuml; -> ü)
 * - Converts **bold** markdown to <strong>bold</strong>
 * - Handles <br> tags (ensures they work as line breaks)
 * - Retains native <sup> tags
 */
const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&cent;': '¢',
    '&pound;': '£',
    '&yen;': '¥',
    '&euro;': '€',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&deg;': '°',
    '&plusmn;': '±',
    '&times;': '×',
    '&divide;': '÷',
    '&micro;': 'µ',
    '&para;': '¶',
    '&middot;': '·',
    '&sect;': '§',
    '&auml;': 'ä',
    '&ouml;': 'ö',
    '&uuml;': 'ü',
    '&Auml;': 'Ä',
    '&Ouml;': 'Ö',
    '&Uuml;': 'Ü',
    '&szlig;': 'ß',
};

/**
 * Decodes HTML entities in a string.
 */
export function decode_entities(text: string | null | undefined): string {
    if (!text) return '';
    return text.replace(/&[a-z0-9#]+;/gi, (match) => {
        return entities[match] || match;
    });
}

/**
 * Preprocesses a string for HTML rendering.
 * - Decodes HTML entities (e.g., &uuml; -> ü)
 * - Converts **bold** markdown to <strong>bold</strong>
 * - Handles <br> tags (ensures they work as line breaks)
 * - Retains native <sup> tags
 */
export function preprocess_html(html: string | null | undefined): string {
    if (!html) return '';
    
    // 1. Decode entities
    let processed = decode_entities(html);

    // 2. Handle Markdown bolding
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 3. Ensure <br> tags are treated correctly (native HTML rendering will handle these)
    processed = processed.replace(/<br\s*\/?>/gi, '<br />');

    return processed;
}

