/* eslint-disable filenames/match-exported */

import * as JestUtil from 'jest-util';
import { ModuleMocker } from 'jest-mock';
import { LegacyFakeTimers, ModernFakeTimers } from '@jest/fake-timers';
import { JestEnvironment, EnvironmentContext } from '@jest/environment';
import { Window, BrowserErrorCaptureEnum, IOptionalBrowserSettings } from 'happy-dom';
// @ts-ignore - Internal import for memory leak fix
import NodeFactory from 'happy-dom/lib/nodes/NodeFactory.js';
import { Script } from 'vm';
import { Global, Config } from '@jest/types';

/**
 * Happy DOM Jest Environment.
 */
export default class HappyDOMEnvironment implements JestEnvironment {
	private _legacyFakeTimers: LegacyFakeTimers<number> | null = null;
	private _modernFakeTimers: ModernFakeTimers | null = null;
	public window: Window | null;
	public global: Global.Global;
	public moduleMocker: ModuleMocker;

	/**
	 * jest-environment-jsdom" has the default set to ['browser']
	 * As changing this value would be a breaking change, we will keep it at ['node', 'node-addons'] until we do a major release
	 *
	 * @see https://stackoverflow.com/questions/72428323/jest-referenceerror-vue-is-not-defined
	 */
	public customExportConditions = ['node', 'node-addons'];

	private _configuredExportConditions: string[];
	private _projectConfig: Config.ProjectConfig | null = null;

	/**
	 * Constructor.
	 *
	 * @param config Jest config.
	 * @param config.globalConfig jest global config.
	 * @param config.projectConfig jest project config.
	 * @param options Options.
	 */
	constructor(
		config:
			| { globalConfig: Config.GlobalConfig; projectConfig: Config.ProjectConfig }
			| Config.ProjectConfig,
		options?: EnvironmentContext
	) {
		let projectConfig: Config.ProjectConfig;
		let globals: Config.ConfigGlobals;
		if (isJestConfigVersion29(config)) {
			// Jest 29
			globals = config.globals;
			projectConfig = config;
		} else if (isJestConfigVersion28(config)) {
			// Jest < 29
			globals = config.projectConfig.globals;
			projectConfig = config.projectConfig;
		} else {
			throw new Error('Unsupported jest version.');
		}

		this._configuredExportConditions = [];

		if ('customExportConditions' in projectConfig.testEnvironmentOptions) {
			const { customExportConditions } = projectConfig.testEnvironmentOptions;
			if (
				Array.isArray(customExportConditions) &&
				customExportConditions.every((condition) => typeof condition === 'string')
			) {
				this._configuredExportConditions = customExportConditions;
			} else {
				throw new Error('Custom export conditions specified but they are not an array of strings');
			}
		}

		// Initialize Window and Global
		this.window = new Window({
			url: 'http://localhost/',
			...projectConfig.testEnvironmentOptions,
			console: options?.console || console,
			settings: {
				...(<IOptionalBrowserSettings>projectConfig.testEnvironmentOptions?.settings),
				errorCapture: BrowserErrorCaptureEnum.disabled
			}
		});

		this.global = <Global.Global>(<unknown>this.window);

		this.moduleMocker = new ModuleMocker(<typeof globalThis>(<unknown>this.window));

		// Node's error-message stack size is limited to 10, but it's pretty useful to see more than that when a test fails.
		this.global.Error.stackTraceLimit = 100;

		// TODO: Remove this ASAP as it currently causes tests to run really slow.
		this.global.Buffer = Buffer;

		// Needed as Jest is using it
		(<any>this.window)['global'] = this.global;

		JestUtil.installCommonGlobals(<typeof globalThis>(<unknown>this.window), globals);

		// For some reason Jest removes the global setImmediate, so we need to add it back.
		this.global.setImmediate = global.setImmediate;

		// Store config for lazy fake timer initialization (both Legacy and Modern)
		this._projectConfig = projectConfig;

		// Jest is using the setTimeout function from Happy DOM internally for detecting when a test times out, but this causes window.happyDOM?.waitUntilComplete() and window.happyDOM?.abort() to not work as expected.
		// This workaround is only needed for jest-jasmine runner (not jest-circus which is the default since Jest 27)
		// Check once at setup time instead of on every setTimeout call
		const isJasmineRunner = new Error('stack').stack?.includes('/jest-jasmine') ?? false;
		if (isJasmineRunner) {
			const happyDOMSetTimeout = this.global.setTimeout;
			(<(...args: unknown[]) => number>this.global.setTimeout) = (...args: unknown[]): number => {
				if (new Error('stack').stack!.includes('/jest-jasmine')) {
					// @ts-ignore
					return global.setTimeout.call(global, ...args);
				}
				// @ts-ignore
				return happyDOMSetTimeout.call(this.global, ...args);
			};
		}
	}

	/**
	 * Lazy getter for legacy fake timers - only created when accessed.
	 * Most tests don't use legacy fake timers, saving significant initialization time.
	 */
	public get fakeTimers(): LegacyFakeTimers<number> | null {
		if (!this._legacyFakeTimers && this._projectConfig) {
			this._legacyFakeTimers = new LegacyFakeTimers({
				config: this._projectConfig,
				global: <typeof globalThis>(<unknown>this.window),
				moduleMocker: this.moduleMocker,
				timerConfig: {
					idToRef: (id: number) => id,
					refToId: (ref: number) => ref
				}
			});
		}
		return this._legacyFakeTimers;
	}

	/**
	 * Setter for legacy fake timers.
	 */
	public set fakeTimers(value: LegacyFakeTimers<number> | null) {
		this._legacyFakeTimers = value;
	}

	/**
	 * Lazy getter for modern fake timers - only created when accessed.
	 * This saves initialization time for tests that don't use fake timers.
	 */
	public get fakeTimersModern(): ModernFakeTimers | null {
		if (!this._modernFakeTimers && this._projectConfig) {
			this._modernFakeTimers = new ModernFakeTimers({
				config: this._projectConfig,
				global: <typeof globalThis>(<unknown>this.window)
			});
		}
		return this._modernFakeTimers;
	}

	/**
	 * Setter for modern fake timers.
	 */
	public set fakeTimersModern(value: ModernFakeTimers | null) {
		this._modernFakeTimers = value;
	}

	/**
	 * Respect any export conditions specified as options
	 * https://jestjs.io/docs/configuration#testenvironmentoptions-object
	 */
	public exportConditions(): string[] {
		return this._configuredExportConditions ?? this.customExportConditions;
	}

	/**
	 * Setup.
	 *
	 * @returns Promise.
	 */
	public async setup(): Promise<void> {}

	/**
	 * Teardown.
	 *
	 * @returns Promise.
	 */
	public async teardown(): Promise<void> {
		// Only dispose fake timers if they were actually created
		if (this._legacyFakeTimers) {
			this._legacyFakeTimers.dispose();
		}
		if (this._modernFakeTimers) {
			this._modernFakeTimers.dispose();
		}

		// Use abort() instead of close() - it's ~300x faster because it doesn't wait for microtasks.
		// In Jest teardown we're destroying everything anyway, so no need to wait.
		if (this.window) {
			await this.window.happyDOM.abort();
		}

		// Null references to help GC
		this.window = null;
		this.global = null!;
		this.moduleMocker = null!;
		this._legacyFakeTimers = null;
		this._modernFakeTimers = null;
		this._projectConfig = null;

		// CRITICAL: Clear NodeFactory.ownerDocuments to fix memory leak
		// Due to a bug in happy-dom, documents are pushed but not always pulled from this static array.
		// Operations like textContent/innerHTML create Text nodes via createTextNode which pushes to
		// ownerDocuments, but the Proxy-based class system causes pullOwnerDocument() to be skipped.
		// Without clearing this, windows cannot be garbage collected.
		if (NodeFactory.ownerDocuments) {
			NodeFactory.ownerDocuments.length = 0;
		}
	}

	/**
	 * Runs a script.
	 *
	 * @param script Script.
	 * @returns Result.
	 */
	public runScript(script: Script): null {
		if (!this.global) {
			return null;
		}
		return script.runInContext(this.global);
	}

	/**
	 * Returns the VM context.
	 *
	 * @returns Context.
	 */
	public getVmContext(): Global.Global | null {
		return this.global;
	}
}

function isJestConfigVersion29(config: unknown): config is Config.ProjectConfig {
	return Object.getOwnPropertyDescriptor(config, 'globals') !== undefined;
}

function isJestConfigVersion28(
	config: unknown
): config is { globalConfig: Config.GlobalConfig; projectConfig: Config.ProjectConfig } {
	return Object.getOwnPropertyDescriptor(config, 'projectConfig') !== undefined;
}
