<script lang="ts">
	/**
	 * Toolbar - Element creation tools
	 *
	 * Floating toolbar with buttons to create different element types:
	 * - Text (h1, h2, p, span)
	 * - Containers (div, section)
	 * - Media (image)
	 * - Interactive (button, link, input)
	 */

	import { createElement, currentPage, designState } from '$lib/stores/design-store';
	import type { Element } from '$lib/types/events';

	let selectedTool: string | null = null;
	let elementCounter = 0; // Counter to offset new elements

	async function createNewElement(elementType: Element['type']) {
		selectedTool = elementType;

		// Default position and size for new elements
		const defaultSize = {
			h1: { width: 300, height: 60 },
			h2: { width: 300, height: 50 },
			h3: { width: 300, height: 40 },
			p: { width: 300, height: 100 },
			span: { width: 150, height: 30 },
			div: { width: 200, height: 200 },
			section: { width: 400, height: 300 },
			img: { width: 200, height: 200 },
			button: { width: 120, height: 40 },
			a: { width: 100, height: 30 },
			input: { width: 200, height: 40 }
		};

		const defaultContent = {
			h1: 'Heading 1',
			h2: 'Heading 2',
			h3: 'Heading 3',
			p: 'Paragraph text',
			span: 'Text',
			button: 'Button',
			a: 'Link'
		};

		const size = defaultSize[elementType as keyof typeof defaultSize] || { width: 200, height: 100 };
		const content = defaultContent[elementType as keyof typeof defaultContent] || '';

		// Offset new elements so they don't stack on top of each other
		const offset = elementCounter * 30; // 30px offset per element
		elementCounter++;

		try {
			await createElement({
				pageId: 'canvas', // Free-form canvas, no page restriction
				parentId: null,
				elementType,
				position: { x: 300 + offset, y: 200 + offset }, // Offset position
				size,
				content,
				styles: {
					backgroundColor: elementType === 'div' || elementType === 'section' ? '#f5f5f5' : undefined,
					color: '#000000'
				}
			});

			selectedTool = null;
		} catch (error) {
			console.error('Failed to create element:', error);
			alert('Failed to create element');
		}
	}
</script>

<!-- STYLE: Toolbar - floating left sidebar, sticky -->
<div class="toolbar">
	<div class="toolbar-section">
		<h3>Text</h3>
		<button on:click={() => createNewElement('h1')} class:active={selectedTool === 'h1'}>
			H1
		</button>
		<button on:click={() => createNewElement('h2')} class:active={selectedTool === 'h2'}>
			H2
		</button>
		<button on:click={() => createNewElement('h3')} class:active={selectedTool === 'h3'}>
			H3
		</button>
		<button on:click={() => createNewElement('p')} class:active={selectedTool === 'p'}>
			P
		</button>
		<button on:click={() => createNewElement('span')} class:active={selectedTool === 'span'}>
			Span
		</button>
	</div>

	<div class="toolbar-section">
		<h3>Containers</h3>
		<button on:click={() => createNewElement('div')} class:active={selectedTool === 'div'}>
			Div
		</button>
		<button on:click={() => createNewElement('section')} class:active={selectedTool === 'section'}>
			Section
		</button>
	</div>

	<div class="toolbar-section">
		<h3>Media</h3>
		<button on:click={() => createNewElement('img')} class:active={selectedTool === 'img'}>
			Image
		</button>
	</div>

	<div class="toolbar-section">
		<h3>Interactive</h3>
		<button on:click={() => createNewElement('button')} class:active={selectedTool === 'button'}>
			Button
		</button>
		<button on:click={() => createNewElement('a')} class:active={selectedTool === 'a'}>
			Link
		</button>
		<button on:click={() => createNewElement('input')} class:active={selectedTool === 'input'}>
			Input
		</button>
	</div>
</div>

<style>
	/* STYLE: Add your design here! */
	/* This is unstyled semantic HTML with functional logic */

	.toolbar {
		position: fixed;
		left: 20px;
		top: 80px;
		width: 200px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
		padding: 16px;
		z-index: 100;
		max-height: calc(100vh - 120px);
		overflow-y: auto;
	}

	.toolbar-section {
		margin-bottom: 24px;
	}

	.toolbar-section:last-child {
		margin-bottom: 0;
	}

	.toolbar-section h3 {
		font-size: 12px;
		font-weight: 600;
		color: #666;
		text-transform: uppercase;
		margin: 0 0 8px 0;
		letter-spacing: 0.5px;
	}

	.toolbar button {
		display: block;
		width: 100%;
		padding: 8px 12px;
		margin-bottom: 4px;
		border: 1px solid #ddd;
		background: white;
		text-align: left;
		cursor: pointer;
		border-radius: 4px;
		font-size: 14px;
	}

	.toolbar button:hover {
		background: #f5f5f5;
		border-color: #999;
	}

	.toolbar button.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.toolbar button:last-child {
		margin-bottom: 0;
	}
</style>
