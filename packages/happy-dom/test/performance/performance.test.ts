/* eslint-disable no-console */
import { describe, it, expect } from 'vitest';
import { Window } from '../../src/index.js';

const ITERATIONS = 1000;

function benchmark(name: string, fn: () => void, iterations: number = ITERATIONS): number {
	// Warmup
	for (let i = 0; i < 10; i++) {
		fn();
	}

	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		fn();
	}
	const end = performance.now();
	const totalMs = end - start;
	const perIterationMs = totalMs / iterations;

	console.log(
		`${name}: ${totalMs.toFixed(2)}ms total, ${perIterationMs.toFixed(4)}ms per iteration`
	);
	return totalMs;
}

describe('Performance', () => {
	describe('Window Creation', () => {
		it('should create Window instances efficiently', () => {
			const time = benchmark(
				'Window creation',
				() => {
					const window = new Window();
					window.close();
				},
				100
			);

			// Should create 100 windows in under 5 seconds
			expect(time).toBeLessThan(5000);
		});
	});

	describe('Query Selectors', () => {
		it('should parse selectors efficiently', () => {
			const window = new Window();
			const document = window.document;

			// Setup DOM
			document.body.innerHTML = `
				<div id="container" class="main">
					<div class="item" data-id="1">Item 1</div>
					<div class="item" data-id="2">Item 2</div>
					<div class="item" data-id="3">Item 3</div>
					<span class="label">Label</span>
				</div>
			`;

			const time = benchmark('querySelector with complex selector', () => {
				document.querySelector('div.main > div.item[data-id="1"]');
			});

			expect(time).toBeLessThan(1000);
			window.close();
		});

		it('should querySelectorAll efficiently', () => {
			const window = new Window();
			const document = window.document;

			// Setup DOM with many elements
			let html = '<div id="container">';
			for (let i = 0; i < 100; i++) {
				html += `<div class="item item-${i % 10}" data-index="${i}">Item ${i}</div>`;
			}
			html += '</div>';
			document.body.innerHTML = html;

			const time = benchmark('querySelectorAll', () => {
				document.querySelectorAll('.item');
			});

			expect(time).toBeLessThan(2000);
			window.close();
		});
	});

	describe('CSS Parsing', () => {
		it('should parse inline styles efficiently', () => {
			const window = new Window();
			const document = window.document;
			const div = document.createElement('div');
			document.body.appendChild(div);

			const time = benchmark('inline style parsing', () => {
				div.style.cssText =
					'color: red; background-color: blue; margin: 10px; padding: 20px; border: 1px solid black;';
			});

			expect(time).toBeLessThan(1000);
			window.close();
		});
	});

	describe('HTML Parsing', () => {
		it('should parse HTML efficiently', () => {
			const window = new Window();
			const document = window.document;

			const html = `
				<div class="container">
					<header><h1>Title</h1></header>
					<nav><ul><li><a href="#">Link 1</a></li><li><a href="#">Link 2</a></li></ul></nav>
					<main>
						<article><h2>Article</h2><p>Content here</p></article>
					</main>
					<footer><p>Footer</p></footer>
				</div>
			`;

			const time = benchmark('innerHTML parsing', () => {
				document.body.innerHTML = html;
			});

			expect(time).toBeLessThan(2000);
			window.close();
		});

		it('should parse attributes efficiently', () => {
			const window = new Window();
			const document = window.document;

			const time = benchmark('element with many attributes', () => {
				document.body.innerHTML = `
					<div
						id="test"
						class="foo bar baz"
						data-a="1"
						data-b="2"
						data-c="3"
						title="Test title"
						aria-label="Label"
						role="button"
						tabindex="0"
					>Content</div>
				`;
			});

			expect(time).toBeLessThan(1000);
			window.close();
		});
	});

	describe('DOM Operations', () => {
		it('should create elements efficiently', () => {
			const window = new Window();
			const document = window.document;

			const time = benchmark('createElement', () => {
				const div = document.createElement('div');
				div.className = 'test';
				div.id = 'test-id';
				document.body.appendChild(div);
				document.body.removeChild(div);
			});

			expect(time).toBeLessThan(1000);
			window.close();
		});

		it('should handle classList operations efficiently', () => {
			const window = new Window();
			const document = window.document;
			const div = document.createElement('div');
			document.body.appendChild(div);

			const time = benchmark('classList operations', () => {
				div.classList.add('foo', 'bar', 'baz');
				div.classList.remove('bar');
				div.classList.toggle('qux');
				div.classList.contains('foo');
			});

			expect(time).toBeLessThan(500);
			window.close();
		});
	});

	describe('Event Handling', () => {
		it('should dispatch events efficiently', () => {
			const window = new Window();
			const document = window.document;
			const div = document.createElement('div');
			document.body.appendChild(div);

			let count = 0;
			div.addEventListener('click', () => count++);

			const event = new window.MouseEvent('click');

			const time = benchmark('event dispatch', () => {
				div.dispatchEvent(event);
			});

			expect(time).toBeLessThan(500);
			expect(count).toBe(ITERATIONS + 10); // +10 for warmup
			window.close();
		});
	});

	describe('getByRole-related operations', () => {
		it('should query all elements efficiently', () => {
			const window = new Window();
			const document = window.document;

			// Setup a realistic DOM with many elements
			document.body.innerHTML = `
				<header>
					<nav aria-label="Main">
						<ul role="menubar">
							<li role="none"><a href="#" role="menuitem">Home</a></li>
							<li role="none"><a href="#" role="menuitem">About</a></li>
							<li role="none"><a href="#" role="menuitem">Contact</a></li>
						</ul>
					</nav>
				</header>
				<main>
					<form>
						<div role="group" aria-labelledby="name-label">
							<label id="name-label" for="name">Name</label>
							<input id="name" type="text" aria-required="true">
						</div>
						<div role="group" aria-labelledby="email-label">
							<label id="email-label" for="email">Email</label>
							<input id="email" type="email" aria-required="true">
						</div>
						<button type="submit">Submit</button>
					</form>
					<table role="grid">
						<thead><tr><th>Col 1</th><th>Col 2</th></tr></thead>
						<tbody>
							<tr><td>A</td><td>B</td></tr>
							<tr><td>C</td><td>D</td></tr>
						</tbody>
					</table>
				</main>
			`;

			const time = benchmark(
				'querySelectorAll(*)',
				() => {
					document.querySelectorAll('*');
				},
				500
			);

			expect(time).toBeLessThan(1000);
			window.close();
		});

		it('should getAttribute aria-* efficiently', () => {
			const window = new Window();
			const document = window.document;

			document.body.innerHTML = `
				<button aria-label="Close" aria-pressed="false" aria-expanded="true" aria-haspopup="menu">
					<span aria-hidden="true">×</span>
				</button>
			`;

			const button = document.querySelector('button')!;

			const time = benchmark('getAttribute aria-*', () => {
				button.getAttribute('aria-label');
				button.getAttribute('aria-pressed');
				button.getAttribute('aria-expanded');
				button.getAttribute('aria-haspopup');
				button.getAttribute('role');
				button.hasAttribute('disabled');
			});

			expect(time).toBeLessThan(500);
			window.close();
		});

		it('should getComputedStyle efficiently', () => {
			const window = new Window();
			const document = window.document;

			document.body.innerHTML = `
				<style>
					.container { display: flex; visibility: visible; }
					.hidden { display: none; }
				</style>
				<div class="container">
					<button>Visible Button</button>
					<span class="hidden">Hidden</span>
				</div>
			`;

			const button = document.querySelector('button')!;

			const time = benchmark(
				'getComputedStyle',
				() => {
					const style = window.getComputedStyle(button);
					style.display;
					style.visibility;
				},
				500
			);

			expect(time).toBeLessThan(2000);
			window.close();
		});

		it('should access textContent efficiently', () => {
			const window = new Window();
			const document = window.document;

			document.body.innerHTML = `
				<div>
					<span>First</span>
					<span>Second</span>
					<span>Third</span>
					<strong>Important</strong>
				</div>
			`;

			const div = document.querySelector('div')!;

			const time = benchmark('textContent', () => {
				div.textContent;
			});

			expect(time).toBeLessThan(500);
			window.close();
		});

		it('should matches() efficiently', () => {
			const window = new Window();
			const document = window.document;

			document.body.innerHTML = `<button class="primary large" disabled aria-pressed="true">Click</button>`;
			const button = document.querySelector('button')!;

			const time = benchmark('matches()', () => {
				button.matches('button');
				button.matches('.primary');
				button.matches('[disabled]');
				button.matches('button.primary.large[disabled]');
			});

			expect(time).toBeLessThan(500);
			window.close();
		});

		it('should closest() efficiently', () => {
			const window = new Window();
			const document = window.document;

			document.body.innerHTML = `
				<form>
					<div class="field">
						<label>
							<input type="text">
						</label>
					</div>
				</form>
			`;

			const input = document.querySelector('input')!;

			const time = benchmark('closest()', () => {
				input.closest('label');
				input.closest('.field');
				input.closest('form');
				input.closest('body');
			});

			expect(time).toBeLessThan(500);
			window.close();
		});
	});

	describe('Parallel Window Creation (Proxy optimization)', () => {
		it('should create many windows efficiently (validates Proxy-based class extension)', () => {
			// This test validates the optimization in WindowContextClassExtender
			// that uses Proxy construct traps instead of creating new class definitions per window
			const windows: InstanceType<typeof Window>[] = [];

			const time = benchmark(
				'create 50 windows and perform operations',
				() => {
					const win = new Window();
					// Perform operations that exercise the proxied classes
					win.document.createElement('div');
					win.document.body.innerHTML = '<span class="test">content</span>';
					win.document.querySelector('.test');
					windows.push(win);
				},
				50
			);

			// Clean up
			for (const win of windows) {
				win.close();
			}

			// Should create 50 windows with operations in under 10 seconds
			expect(time).toBeLessThan(10000);
		});

		it('should handle concurrent window operations without class definition conflicts', () => {
			// This validates that Proxy-based window injection doesn't cause
			// issues when multiple windows exist simultaneously
			const windowCount = 20;
			const windows: InstanceType<typeof Window>[] = [];

			// Create multiple windows
			for (let i = 0; i < windowCount; i++) {
				windows.push(new Window());
			}

			const time = benchmark(
				'operate on 20 concurrent windows',
				() => {
					for (const win of windows) {
						const div = win.document.createElement('div');
						div.className = 'test-class';
						win.document.body.appendChild(div);
						win.document.querySelectorAll('.test-class');
					}
				},
				100
			);

			// Clean up
			for (const win of windows) {
				win.close();
			}

			// Should handle 100 iterations of operations across 20 windows in under 5 seconds
			expect(time).toBeLessThan(5000);
		});
	});

	describe('Deep Selector Matching (slice optimization)', () => {
		it('should match deeply nested selectors efficiently', () => {
			// This test validates the QuerySelector optimization that replaces
			// .slice(1) with index parameters to avoid array allocation during recursion
			const window = new Window();
			const document = window.document;

			// Create deeply nested DOM structure
			let html = '<div class="level-0">';
			for (let i = 1; i <= 10; i++) {
				html += `<div class="level-${i}">`;
			}
			html += '<span class="target">Target</span>';
			for (let i = 10; i >= 1; i--) {
				html += '</div>';
			}
			html += '</div>';
			document.body.innerHTML = html;

			const time = benchmark('deep descendant selector', () => {
				// This selector requires multiple recursive calls
				document.querySelector('.level-0 .level-5 .level-10 .target');
			});

			expect(time).toBeLessThan(1000);
			window.close();
		});

		it('should handle complex multi-part selectors efficiently', () => {
			const window = new Window();
			const document = window.document;

			// Create a wide DOM structure
			let html = '<div class="container">';
			for (let i = 0; i < 50; i++) {
				html += `
					<div class="item item-${i % 5}" data-index="${i}">
						<span class="label">Label ${i}</span>
						<span class="value">Value ${i}</span>
					</div>
				`;
			}
			html += '</div>';
			document.body.innerHTML = html;

			const time = benchmark('querySelectorAll with complex selector', () => {
				// Multi-part selector that exercises the optimized recursion
				document.querySelectorAll('.container > .item .value');
			});

			expect(time).toBeLessThan(2000);
			window.close();
		});

		it('should handle sibling selectors efficiently', () => {
			const window = new Window();
			const document = window.document;

			// Create many siblings
			let html = '<div class="container">';
			for (let i = 0; i < 100; i++) {
				html += `<span class="item-${i % 3}">Item ${i}</span>`;
			}
			html += '</div>';
			document.body.innerHTML = html;

			const time = benchmark('adjacent sibling selector', () => {
				document.querySelectorAll('.item-0 + .item-1');
			});

			expect(time).toBeLessThan(1500);
			window.close();
		});
	});

	describe('Abort/Teardown Performance', () => {
		it('should abort efficiently when no async tasks are pending', async () => {
			const windows: InstanceType<typeof Window>[] = [];
			const windowCount = 100;

			// Create windows with no async tasks
			for (let i = 0; i < windowCount; i++) {
				const window = new Window();
				window.document.body.innerHTML = '<div>test</div>';
				windows.push(window);
			}

			const start = performance.now();
			for (const window of windows) {
				await window.happyDOM.abort();
				window.close();
			}
			const elapsed = performance.now() - start;

			console.log(
				`Abort/close ${windowCount} windows: ${elapsed.toFixed(2)}ms, ${(elapsed / windowCount).toFixed(3)}ms per window`
			);

			// Should complete very quickly when no async tasks - under 0.1ms per window
			expect(elapsed / windowCount).toBeLessThan(0.5);
		});
	});

	describe('DOM Collections (ClassMethodBinder removal)', () => {
		it('should iterate NodeList efficiently', () => {
			const window = new Window();
			const document = window.document;

			let html = '<ul>';
			for (let i = 0; i < 100; i++) {
				html += `<li>Item ${i}</li>`;
			}
			html += '</ul>';
			document.body.innerHTML = html;

			const nodeList = document.querySelectorAll('li');

			const time = benchmark('NodeList iteration and access', () => {
				for (let i = 0; i < nodeList.length; i++) {
					nodeList[i].textContent;
				}
				nodeList.forEach((node) => node.tagName);
			});

			expect(time).toBeLessThan(1000);
			window.close();
		});

		it('should iterate HTMLCollection efficiently', () => {
			const window = new Window();
			const document = window.document;

			let html = '<div>';
			for (let i = 0; i < 100; i++) {
				html += `<span id="item-${i}">Item ${i}</span>`;
			}
			html += '</div>';
			document.body.innerHTML = html;

			const collection = document.getElementsByTagName('span');

			const time = benchmark('HTMLCollection iteration', () => {
				for (let i = 0; i < collection.length; i++) {
					collection[i].id;
					collection[i].textContent;
				}
			});

			expect(time).toBeLessThan(1000);
			window.close();
		});

		it('should handle DOMTokenList operations efficiently', () => {
			const window = new Window();
			const document = window.document;
			const div = document.createElement('div');
			document.body.appendChild(div);

			// Pre-populate with classes
			div.className = 'class-a class-b class-c class-d class-e';

			const time = benchmark('DOMTokenList intensive operations', () => {
				// Access length and items
				const len = div.classList.length;
				for (let i = 0; i < len; i++) {
					div.classList.item(i);
				}
				// Check contains
				div.classList.contains('class-a');
				div.classList.contains('class-z');
				// Iterate
				div.classList.forEach((cls) => cls);
			});

			expect(time).toBeLessThan(500);
			window.close();
		});

		it('should handle NamedNodeMap (attributes) efficiently', () => {
			const window = new Window();
			const document = window.document;

			document.body.innerHTML = `
				<div
					id="test"
					class="foo bar"
					data-a="1" data-b="2" data-c="3" data-d="4" data-e="5"
					title="Test"
					aria-label="Label"
					role="button"
				>Content</div>
			`;

			const div = document.querySelector('div')!;
			const attrs = div.attributes;

			const time = benchmark('NamedNodeMap iteration', () => {
				for (let i = 0; i < attrs.length; i++) {
					attrs[i].name;
					attrs[i].value;
				}
				attrs.getNamedItem('id');
				attrs.getNamedItem('data-a');
			});

			expect(time).toBeLessThan(500);
			window.close();
		});
	});
});
