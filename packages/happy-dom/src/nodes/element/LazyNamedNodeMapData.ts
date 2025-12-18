import Attr from '../attr/Attr.js';

/**
 * Lazy data container for NamedNodeMap that only creates Maps when first accessed.
 * Most elements have no attributes, so this saves significant memory.
 */
export default class LazyNamedNodeMapData {
	private _itemsByNamespaceURI: Map<string, Attr> | null = null;
	private _itemsByName: Map<string, Attr[]> | null = null;
	private _items: Map<string, Attr> | null = null;

	/**
	 * Returns items by namespace URI map, creating it lazily if needed.
	 */
	public get itemsByNamespaceURI(): Map<string, Attr> {
		if (this._itemsByNamespaceURI === null) {
			this._itemsByNamespaceURI = new Map();
		}
		return this._itemsByNamespaceURI;
	}

	/**
	 * Setter for itemsByNamespaceURI.
	 */
	public set itemsByNamespaceURI(value: Map<string, Attr>) {
		this._itemsByNamespaceURI = value;
	}

	/**
	 * Returns items by name map, creating it lazily if needed.
	 */
	public get itemsByName(): Map<string, Attr[]> {
		if (this._itemsByName === null) {
			this._itemsByName = new Map();
		}
		return this._itemsByName;
	}

	/**
	 * Setter for itemsByName.
	 */
	public set itemsByName(value: Map<string, Attr[]>) {
		this._itemsByName = value;
	}

	/**
	 * Returns all items map, creating it lazily if needed.
	 */
	public get items(): Map<string, Attr> {
		if (this._items === null) {
			this._items = new Map();
		}
		return this._items;
	}

	/**
	 * Setter for items.
	 */
	public set items(value: Map<string, Attr>) {
		this._items = value;
	}

	/**
	 * Returns true if there are any items.
	 */
	public get hasItems(): boolean {
		return this._items !== null && this._items.size > 0;
	}

	/**
	 * Clears all maps.
	 */
	public clear(): void {
		if (this._itemsByNamespaceURI !== null) {
			this._itemsByNamespaceURI.clear();
			this._itemsByNamespaceURI = null;
		}
		if (this._itemsByName !== null) {
			this._itemsByName.clear();
			this._itemsByName = null;
		}
		if (this._items !== null) {
			this._items.clear();
			this._items = null;
		}
	}
}
