import TEventListener from './TEventListener.js';
import IEventListenerOptions from './IEventListenerOptions.js';

/**
 * Lazy listener map that only creates the Map when first accessed.
 */
class LazyListenerMap {
	private _capturing: Map<string, TEventListener[]> | null = null;
	private _bubbling: Map<string, TEventListener[]> | null = null;

	/**
	 * Returns capturing listeners map, creating it lazily if needed.
	 */
	public get capturing(): Map<string, TEventListener[]> {
		if (this._capturing === null) {
			this._capturing = new Map();
		}
		return this._capturing;
	}

	/**
	 * Returns bubbling listeners map, creating it lazily if needed.
	 */
	public get bubbling(): Map<string, TEventListener[]> {
		if (this._bubbling === null) {
			this._bubbling = new Map();
		}
		return this._bubbling;
	}

	/**
	 * Clears all listeners.
	 */
	public clear(): void {
		if (this._capturing !== null) {
			this._capturing.clear();
		}
		if (this._bubbling !== null) {
			this._bubbling.clear();
		}
	}
}

/**
 * Lazy options map that only creates the Map when first accessed.
 */
class LazyOptionsMap {
	private _capturing: Map<string, IEventListenerOptions[]> | null = null;
	private _bubbling: Map<string, IEventListenerOptions[]> | null = null;

	/**
	 * Returns capturing options map, creating it lazily if needed.
	 */
	public get capturing(): Map<string, IEventListenerOptions[]> {
		if (this._capturing === null) {
			this._capturing = new Map();
		}
		return this._capturing;
	}

	/**
	 * Returns bubbling options map, creating it lazily if needed.
	 */
	public get bubbling(): Map<string, IEventListenerOptions[]> {
		if (this._bubbling === null) {
			this._bubbling = new Map();
		}
		return this._bubbling;
	}

	/**
	 * Clears all options.
	 */
	public clear(): void {
		if (this._capturing !== null) {
			this._capturing.clear();
		}
		if (this._bubbling !== null) {
			this._bubbling.clear();
		}
	}
}

export { LazyListenerMap, LazyOptionsMap };
