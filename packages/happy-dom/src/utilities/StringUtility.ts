// Cache for ASCII case conversions - limited size to prevent unbounded growth
const ASCII_LOWER_CASE_CACHE: Map<string, string> = new Map();
const ASCII_UPPER_CASE_CACHE: Map<string, string> = new Map();
const MAX_CACHE_SIZE = 1000;

// Pre-populate cache with common HTML tag names and attributes (already lowercase)
const COMMON_LOWERCASE = [
	'div',
	'span',
	'p',
	'a',
	'button',
	'input',
	'form',
	'label',
	'img',
	'ul',
	'li',
	'ol',
	'table',
	'tr',
	'td',
	'th',
	'thead',
	'tbody',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'header',
	'footer',
	'nav',
	'main',
	'section',
	'article',
	'aside',
	'figure',
	'figcaption',
	'class',
	'id',
	'style',
	'href',
	'src',
	'alt',
	'title',
	'type',
	'name',
	'value',
	'placeholder',
	'disabled',
	'checked',
	'selected',
	'readonly',
	'required',
	'hidden',
	'data',
	'role',
	'aria',
	'tabindex',
	'target',
	'rel',
	'action',
	'method',
	'for',
	'svg',
	'path',
	'circle',
	'rect',
	'line',
	'polygon',
	'polyline',
	'text',
	'g',
	'defs',
	'use',
	'symbol',
	'clippath',
	'mask',
	'pattern',
	'lineargradient',
	'radialgradient',
	'stop',
	'script',
	'link',
	'meta',
	'head',
	'body',
	'html',
	'title',
	'base',
	'br',
	'hr',
	'pre',
	'code',
	'blockquote',
	'em',
	'strong',
	'i',
	'b',
	'u',
	's',
	'small',
	'sub',
	'sup',
	'textarea',
	'select',
	'option',
	'optgroup',
	'fieldset',
	'legend',
	'datalist',
	'output',
	'canvas',
	'video',
	'audio',
	'source',
	'track',
	'iframe',
	'embed',
	'object',
	'param',
	'slot',
	'template',
	'dialog',
	'details',
	'summary',
	'menu',
	'menuitem'
];
for (const word of COMMON_LOWERCASE) {
	ASCII_LOWER_CASE_CACHE.set(word, word);
}

/**
 * String utility.
 */
export default class StringUtility {
	/**
	 * ASCII lowercase.
	 *
	 * @see https://infra.spec.whatwg.org/#ascii-lowercase
	 * @param text Text.
	 * @returns Lowercase text.
	 */
	public static asciiLowerCase(text: string): string {
		const cached = ASCII_LOWER_CASE_CACHE.get(text);
		if (cached !== undefined) {
			return cached;
		}

		// Fast path: check if already lowercase (very common case)
		const len = text.length;
		let needsConversion = false;
		for (let i = 0; i < len; i++) {
			const code = text.charCodeAt(i);
			if (code >= 65 && code <= 90) {
				needsConversion = true;
				break;
			}
		}

		const newText = needsConversion ? text.toLowerCase() : text;

		// Limit cache size to prevent unbounded memory growth
		if (ASCII_LOWER_CASE_CACHE.size >= MAX_CACHE_SIZE) {
			ASCII_LOWER_CASE_CACHE.clear();
			// Re-populate with common values
			for (const word of COMMON_LOWERCASE) {
				ASCII_LOWER_CASE_CACHE.set(word, word);
			}
		}
		ASCII_LOWER_CASE_CACHE.set(text, newText);
		return newText;
	}

	/**
	 * ASCII uppercase.
	 *
	 * @see https://infra.spec.whatwg.org/#ascii-uppercase
	 * @param text Text.
	 * @returns Uppercase text.
	 */
	public static asciiUpperCase(text: string): string {
		const cached = ASCII_UPPER_CASE_CACHE.get(text);
		if (cached !== undefined) {
			return cached;
		}

		// Fast path: check if already uppercase (common for tag names like DIV, SPAN)
		const len = text.length;
		let needsConversion = false;
		for (let i = 0; i < len; i++) {
			const code = text.charCodeAt(i);
			if (code >= 97 && code <= 122) {
				needsConversion = true;
				break;
			}
		}

		const newText = needsConversion ? text.toUpperCase() : text;

		// Limit cache size to prevent unbounded memory growth
		if (ASCII_UPPER_CASE_CACHE.size >= MAX_CACHE_SIZE) {
			ASCII_UPPER_CASE_CACHE.clear();
		}
		ASCII_UPPER_CASE_CACHE.set(text, newText);
		return newText;
	}
}
