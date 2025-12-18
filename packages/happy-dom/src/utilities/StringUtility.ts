// LRU-style cache for ASCII case conversion
// Map preserves insertion order, so we can evict oldest entries
const CACHE_MAX_SIZE = 10000;
const CACHE_EVICT_COUNT = 1000; // Evict this many entries when limit reached
const ASCII_LOWER_CASE_CACHE: Map<string, string> = new Map();
const ASCII_UPPER_CASE_CACHE: Map<string, string> = new Map();

// Instrumentation for debugging (can be enabled via env var)
const DEBUG_CACHE =
	typeof process !== 'undefined' && process.env?.HAPPY_DOM_DEBUG_STRING_CACHE === '1';
let lowerCacheHits = 0;
let lowerCacheMisses = 0;
let upperCacheHits = 0;
let upperCacheMisses = 0;
let evictionCount = 0;

if (DEBUG_CACHE) {
	process.on('exit', () => {
		/* eslint-disable no-console */
		console.log('[StringUtility Cache Stats]');
		console.log(
			`  Lower: ${lowerCacheHits} hits, ${lowerCacheMisses} misses, size=${ASCII_LOWER_CASE_CACHE.size}`
		);
		console.log(
			`  Upper: ${upperCacheHits} hits, ${upperCacheMisses} misses, size=${ASCII_UPPER_CASE_CACHE.size}`
		);
		console.log(`  Evictions: ${evictionCount}`);
		if (ASCII_LOWER_CASE_CACHE.size > 0) {
			const samples = Array.from(ASCII_LOWER_CASE_CACHE.keys()).slice(0, 10);
			console.log(`  Sample keys: ${samples.join(', ')}`);
		}
		/* eslint-enable no-console */
	});
}

/**
 * Evicts oldest entries from cache using Map's insertion order.
 * @param cache
 * @param count
 */
function evictOldest(cache: Map<string, string>, count: number): void {
	const iterator = cache.keys();
	for (let i = 0; i < count; i++) {
		const result = iterator.next();
		if (result.done) {
			break;
		}
		cache.delete(result.value);
	}
	if (DEBUG_CACHE) {
		evictionCount++;
	}
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
			if (DEBUG_CACHE) {
				lowerCacheHits++;
			}
			// Move to end for LRU behavior (delete + set moves to end)
			ASCII_LOWER_CASE_CACHE.delete(text);
			ASCII_LOWER_CASE_CACHE.set(text, cached);
			return cached;
		}
		if (DEBUG_CACHE) {
			lowerCacheMisses++;
		}

		let newText = '';
		for (const char of text) {
			const value = char.charCodeAt(0);
			if (value >= 65 && value <= 90) {
				newText += String.fromCharCode(value + 32);
			} else {
				newText += char;
			}
		}

		// Evict oldest entries if at capacity
		if (ASCII_LOWER_CASE_CACHE.size >= CACHE_MAX_SIZE) {
			evictOldest(ASCII_LOWER_CASE_CACHE, CACHE_EVICT_COUNT);
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
			if (DEBUG_CACHE) {
				upperCacheHits++;
			}
			// Move to end for LRU behavior
			ASCII_UPPER_CASE_CACHE.delete(text);
			ASCII_UPPER_CASE_CACHE.set(text, cached);
			return cached;
		}
		if (DEBUG_CACHE) {
			upperCacheMisses++;
		}

		let newText = '';
		for (const char of text) {
			const value = char.charCodeAt(0);
			if (value >= 97 && value <= 122) {
				newText += String.fromCharCode(value - 32);
			} else {
				newText += char;
			}
		}

		// Evict oldest entries if at capacity
		if (ASCII_UPPER_CASE_CACHE.size >= CACHE_MAX_SIZE) {
			evictOldest(ASCII_UPPER_CASE_CACHE, CACHE_EVICT_COUNT);
		}
		ASCII_UPPER_CASE_CACHE.set(text, newText);
		return newText;
	}
}
