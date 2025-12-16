import BrowserWindow from './BrowserWindow.js';
import * as PropertySymbol from '../PropertySymbol.js';

import DocumentImplementation from '../nodes/document/Document.js';
import HTMLDocumentImplementation from '../nodes/html-document/HTMLDocument.js';
import XMLDocumentImplementation from '../nodes/xml-document/XMLDocument.js';
import DocumentFragmentImplementation from '../nodes/document-fragment/DocumentFragment.js';
import TextImplementation from '../nodes/text/Text.js';
import CommentImplementation from '../nodes/comment/Comment.js';
import ImageImplementation from '../nodes/html-image-element/Image.js';
import AudioImplementation from '../nodes/html-audio-element/Audio.js';
import MutationObserverImplementation from '../mutation-observer/MutationObserver.js';
import MessagePortImplementation from '../event/MessagePort.js';
import CSSStyleSheetImplementation from '../css/CSSStyleSheet.js';
import DOMExceptionImplementation from '../exception/DOMException.js';
import HeadersImplementation from '../fetch/Headers.js';
import RequestImplementation from '../fetch/Request.js';
import ResponseImplementation from '../fetch/Response.js';
import EventTargetImplementation from '../event/EventTarget.js';
import XMLHttpRequestUploadImplementation from '../xml-http-request/XMLHttpRequestUpload.js';
import XMLHttpRequestEventTargetImplementation from '../xml-http-request/XMLHttpRequestEventTarget.js';
import AbortControllerImplementation from '../fetch/AbortController.js';
import AbortSignalImplementation from '../fetch/AbortSignal.js';
import FormDataImplementation from '../form-data/FormData.js';
import PermissionStatusImplementation from '../permissions/PermissionStatus.js';
import XMLHttpRequestImplementation from '../xml-http-request/XMLHttpRequest.js';
import DOMParserImplementation from '../dom-parser/DOMParser.js';
import RangeImplementation from '../range/Range.js';
import VTTCueImplementation from '../nodes/html-media-element/VTTCue.js';
import TextTrackImplementation from '../nodes/html-media-element/TextTrack.js';
import TextTrackListImplementation from '../nodes/html-media-element/TextTrackList.js';
import TextTrackCueImplementation from '../nodes/html-media-element/TextTrackCue.js';
import RemotePlaybackImplementation from '../nodes/html-media-element/RemotePlayback.js';
import FileReaderImplementation from '../file/FileReader.js';
import MediaStreamImplementation from '../nodes/html-media-element/MediaStream.js';
import MediaStreamTrackImplementation from '../nodes/html-media-element/MediaStreamTrack.js';
import CanvasCaptureMediaStreamTrackImplementation from '../nodes/html-canvas-element/CanvasCaptureMediaStreamTrack.js';
import URLImplementation from '../url/URL.js';

/**
 * Creates a proxy class that injects window into instances on construction.
 * This is much more efficient than creating new class definitions per window.
 *
 * The approach: temporarily set window on the prototype during construction,
 * then set it on the instance and clean up. This allows constructors to access
 * window during initialization while keeping memory efficient.
 *
 * @param Implementation The base implementation class.
 * @param window The window to inject.
 * @param setStaticWindow Whether to also set window as a static property.
 * @returns Proxied class constructor.
 */
function createWindowAwareClass<T extends abstract new (...args: any[]) => any>(
	Implementation: T,
	window: BrowserWindow,
	setStaticWindow = false
): T {
	const proxy: T = new Proxy(Implementation, {
		construct(target, args, newTarget) {
			// Temporarily set window on prototype so constructor can access it
			const originalWindow = target.prototype[PropertySymbol.window];
			target.prototype[PropertySymbol.window] = window;

			try {
				const instance = Reflect.construct(target, args, newTarget);
				// Set window directly on instance (overrides prototype lookup)
				instance[PropertySymbol.window] = window;
				// Make constructor point to proxy so clone() methods work correctly
				Object.defineProperty(instance, 'constructor', {
					value: proxy,
					writable: true,
					configurable: true
				});
				return instance;
			} finally {
				// Restore original prototype value
				if (originalWindow === undefined) {
					delete target.prototype[PropertySymbol.window];
				} else {
					target.prototype[PropertySymbol.window] = originalWindow;
				}
			}
		},
		get(target, prop, receiver) {
			if (setStaticWindow && prop === PropertySymbol.window) {
				return window;
			}
			return Reflect.get(target, prop, receiver);
		}
	});
	return proxy;
}

/**
 * Extends classes with a "window" property, so that they internally can access it's Window context.
 *
 * By using WindowBrowserContext, the classes can get access to their Browser context, for accessing settings or navigating the browser.
 *
 * OPTIMIZED: Uses Proxy construct traps instead of creating new class definitions per window.
 * This significantly reduces memory allocation and improves parallel test performance.
 */
export default class WindowContextClassExtender {
	/**
	 * Extends classes with a "window" property.
	 *
	 * @param window Window.
	 */
	public static extendClasses(window: BrowserWindow): void {
		// Document classes
		(<any>window).Document = createWindowAwareClass(DocumentImplementation, window);
		(<any>window).HTMLDocument = createWindowAwareClass(HTMLDocumentImplementation, window);
		(<any>window).XMLDocument = createWindowAwareClass(XMLDocumentImplementation, window);
		(<any>window).DocumentFragment = createWindowAwareClass(DocumentFragmentImplementation, window);

		// Node classes
		(<any>window).Text = createWindowAwareClass(TextImplementation, window);
		(<any>window).Comment = createWindowAwareClass(CommentImplementation, window);
		(<any>window).Image = createWindowAwareClass(ImageImplementation, window);
		(<any>window).Audio = createWindowAwareClass(AudioImplementation, window);

		// Observer and port classes
		(<any>window).MutationObserver = createWindowAwareClass(MutationObserverImplementation, window);
		(<any>window).MessagePort = createWindowAwareClass(MessagePortImplementation, window);

		// CSS classes
		(<any>window).CSSStyleSheet = createWindowAwareClass(CSSStyleSheetImplementation, window);

		// Exception class (no window on prototype needed)
		(<any>window).DOMException = createWindowAwareClass(DOMExceptionImplementation, window);

		// Fetch classes
		(<any>window).Headers = createWindowAwareClass(HeadersImplementation, window);
		(<any>window).Request = createWindowAwareClass(RequestImplementation, window);
		(<any>window).Response = createWindowAwareClass(ResponseImplementation, window, true);

		// Event classes
		(<any>window).EventTarget = createWindowAwareClass(EventTargetImplementation, window);

		// XMLHttpRequest classes
		(<any>window).XMLHttpRequestUpload = createWindowAwareClass(
			XMLHttpRequestUploadImplementation,
			window
		);
		(<any>window).XMLHttpRequestEventTarget = createWindowAwareClass(
			XMLHttpRequestEventTargetImplementation,
			window
		);
		(<any>window).XMLHttpRequest = createWindowAwareClass(XMLHttpRequestImplementation, window);

		// Abort classes
		(<any>window).AbortController = createWindowAwareClass(AbortControllerImplementation, window);
		(<any>window).AbortSignal = createWindowAwareClass(AbortSignalImplementation, window, true);

		// Form and permission classes
		(<any>window).FormData = createWindowAwareClass(FormDataImplementation, window);
		(<any>window).PermissionStatus = createWindowAwareClass(PermissionStatusImplementation, window);

		// Parser and range classes
		(<any>window).DOMParser = createWindowAwareClass(DOMParserImplementation, window);
		(<any>window).Range = createWindowAwareClass(RangeImplementation, window);

		// Media classes
		(<any>window).VTTCue = createWindowAwareClass(VTTCueImplementation, window);
		(<any>window).TextTrack = createWindowAwareClass(TextTrackImplementation, window);
		(<any>window).TextTrackList = createWindowAwareClass(TextTrackListImplementation, window);
		(<any>window).TextTrackCue = createWindowAwareClass(TextTrackCueImplementation, window);
		(<any>window).RemotePlayback = createWindowAwareClass(RemotePlaybackImplementation, window);
		(<any>window).FileReader = createWindowAwareClass(FileReaderImplementation, window);
		(<any>window).MediaStream = createWindowAwareClass(MediaStreamImplementation, window);
		(<any>window).MediaStreamTrack = createWindowAwareClass(MediaStreamTrackImplementation, window);
		(<any>window).CanvasCaptureMediaStreamTrack = createWindowAwareClass(
			CanvasCaptureMediaStreamTrackImplementation,
			window
		);

		// URL class
		(<any>window).URL = createWindowAwareClass(URLImplementation, window);
	}
}
