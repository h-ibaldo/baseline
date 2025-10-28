<script lang="ts">
	/**
	 * Page Builder - Main application interface
	 *
	 * This is the page builder interface where users design pages.
	 * Features:
	 * - Canvas with zoom/pan
	 * - Element toolbar
	 * - Keyboard shortcuts (Cmd+Z undo, Cmd+Shift+Z redo)
	 */

	import { onMount } from 'svelte';
	import Canvas from '$lib/components/canvas/Canvas.svelte';
	import Toolbar from '$lib/components/canvas/Toolbar.svelte';
	import PropertiesWindow from '$lib/components/canvas/PropertiesWindow.svelte';
	import { setupKeyboardShortcuts } from '$lib/stores/design-store';

	let cleanupKeyboard: (() => void) | undefined;

	onMount(() => {
		// Setup keyboard shortcuts for undo/redo
		cleanupKeyboard = setupKeyboardShortcuts();

		return () => {
			if (cleanupKeyboard) cleanupKeyboard();
		};
	});
</script>

<svelte:head>
	<title>LineBasis - Page Builder</title>
</svelte:head>

<!-- STYLE: Page builder layout - full viewport -->
<div class="page-builder">
	<!-- Toolbar for creating elements -->
	<Toolbar />

	<!-- Main canvas -->
	<Canvas />

	<!-- Properties window -->
	<PropertiesWindow />
</div>

<style>
	.page-builder {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		position: relative;
	}
</style>
