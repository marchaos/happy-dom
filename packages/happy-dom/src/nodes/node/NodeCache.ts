import ICachedQuerySelectorResult from './ICachedQuerySelectorResult.js';
import ICachedQuerySelectorAllResult from './ICachedQuerySelectorAllResult.js';
import ICachedMatchesResult from './ICachedMatchesResult.js';
import ICachedElementsByTagNameResult from './ICachedElementsByTagNameResult.js';
import ICachedElementByTagNameResult from './ICachedElementByTagNameResult.js';
import ICachedElementByIdResult from './ICachedElementByIdResult.js';
import ICachedComputedStyleResult from './ICachedComputedStyleResult.js';

/**
 * Lazy node cache that only creates Maps when they are first accessed.
 * This significantly reduces memory allocation for nodes that never use caching.
 */
export default class NodeCache {
	private _querySelector: Map<string, ICachedQuerySelectorResult> | null = null;
	private _querySelectorAll: Map<string, ICachedQuerySelectorAllResult> | null = null;
	private _matches: Map<string, ICachedMatchesResult> | null = null;
	private _elementsByTagName: Map<string, ICachedElementsByTagNameResult> | null = null;
	private _elementsByTagNameNS: Map<string, ICachedElementsByTagNameResult> | null = null;
	private _elementByTagName: Map<string, ICachedElementByTagNameResult> | null = null;
	private _elementById: Map<string, ICachedElementByIdResult> | null = null;
	public computedStyle: ICachedComputedStyleResult | null = null;

	/**
	 *
	 */
	public get querySelector(): Map<string, ICachedQuerySelectorResult> {
		if (this._querySelector === null) {
			this._querySelector = new Map();
		}
		return this._querySelector;
	}

	/**
	 *
	 */
	public set querySelector(value: Map<string, ICachedQuerySelectorResult> | null) {
		this._querySelector = value;
	}

	/**
	 *
	 */
	public get querySelectorAll(): Map<string, ICachedQuerySelectorAllResult> {
		if (this._querySelectorAll === null) {
			this._querySelectorAll = new Map();
		}
		return this._querySelectorAll;
	}

	/**
	 *
	 */
	public set querySelectorAll(value: Map<string, ICachedQuerySelectorAllResult> | null) {
		this._querySelectorAll = value;
	}

	/**
	 *
	 */
	public get matches(): Map<string, ICachedMatchesResult> {
		if (this._matches === null) {
			this._matches = new Map();
		}
		return this._matches;
	}

	/**
	 *
	 */
	public set matches(value: Map<string, ICachedMatchesResult> | null) {
		this._matches = value;
	}

	/**
	 *
	 */
	public get elementsByTagName(): Map<string, ICachedElementsByTagNameResult> {
		if (this._elementsByTagName === null) {
			this._elementsByTagName = new Map();
		}
		return this._elementsByTagName;
	}

	/**
	 *
	 */
	public set elementsByTagName(value: Map<string, ICachedElementsByTagNameResult> | null) {
		this._elementsByTagName = value;
	}

	/**
	 *
	 */
	public get elementsByTagNameNS(): Map<string, ICachedElementsByTagNameResult> {
		if (this._elementsByTagNameNS === null) {
			this._elementsByTagNameNS = new Map();
		}
		return this._elementsByTagNameNS;
	}

	/**
	 *
	 */
	public set elementsByTagNameNS(value: Map<string, ICachedElementsByTagNameResult> | null) {
		this._elementsByTagNameNS = value;
	}

	/**
	 *
	 */
	public get elementByTagName(): Map<string, ICachedElementByTagNameResult> {
		if (this._elementByTagName === null) {
			this._elementByTagName = new Map();
		}
		return this._elementByTagName;
	}

	/**
	 *
	 */
	public set elementByTagName(value: Map<string, ICachedElementByTagNameResult> | null) {
		this._elementByTagName = value;
	}

	/**
	 *
	 */
	public get elementById(): Map<string, ICachedElementByIdResult> {
		if (this._elementById === null) {
			this._elementById = new Map();
		}
		return this._elementById;
	}

	/**
	 *
	 */
	public set elementById(value: Map<string, ICachedElementByIdResult> | null) {
		this._elementById = value;
	}

	/**
	 * Returns true if any cache has data (for efficient clearing).
	 */
	public get hasData(): boolean {
		return (
			(this._querySelector !== null && this._querySelector.size > 0) ||
			(this._querySelectorAll !== null && this._querySelectorAll.size > 0) ||
			(this._matches !== null && this._matches.size > 0) ||
			(this._elementsByTagName !== null && this._elementsByTagName.size > 0) ||
			(this._elementsByTagNameNS !== null && this._elementsByTagNameNS.size > 0) ||
			(this._elementByTagName !== null && this._elementByTagName.size > 0) ||
			(this._elementById !== null && this._elementById.size > 0) ||
			this.computedStyle !== null
		);
	}

	/**
	 * Clears all caches efficiently by setting Maps to null.
	 */
	public clear(): void {
		if (this._querySelector !== null) {
			for (const item of this._querySelector.values()) {
				if (item.result) {
					item.result = null;
				}
			}
			this._querySelector = null;
		}
		if (this._querySelectorAll !== null) {
			for (const item of this._querySelectorAll.values()) {
				if (item.result) {
					item.result = null;
				}
			}
			this._querySelectorAll = null;
		}
		if (this._matches !== null) {
			for (const item of this._matches.values()) {
				if (item.result) {
					(<ICachedMatchesResult>item).result = null;
				}
			}
			this._matches = null;
		}
		if (this._elementsByTagName !== null) {
			for (const item of this._elementsByTagName.values()) {
				if (item.result) {
					item.result = null;
				}
			}
			this._elementsByTagName = null;
		}
		if (this._elementsByTagNameNS !== null) {
			for (const item of this._elementsByTagNameNS.values()) {
				if (item.result) {
					item.result = null;
				}
			}
			this._elementsByTagNameNS = null;
		}
		if (this._elementByTagName !== null) {
			for (const item of this._elementByTagName.values()) {
				if (item.result) {
					item.result = null;
				}
			}
			this._elementByTagName = null;
		}
		if (this._elementById !== null) {
			for (const item of this._elementById.values()) {
				if (item.result) {
					item.result = null;
				}
			}
			this._elementById = null;
		}
		this.computedStyle = null;
	}
}
