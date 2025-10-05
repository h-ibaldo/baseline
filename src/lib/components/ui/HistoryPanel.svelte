<script lang="ts">
	/**
	 * History Panel Component
	 * Shows undo/redo controls and history statistics
	 */
	import { undo, redo, canUndo, canRedo, historyStats } from '$lib/stores/event-store';

	/**
	 * Handle keyboard shortcuts
	 */
	function handleKeydown(event: KeyboardEvent) {
		// Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
		if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
			event.preventDefault();
			if ($canUndo) {
				undo();
			}
		}
		
		// Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (Windows/Linux) or Ctrl+Y
		if (
			((event.metaKey || event.ctrlKey) && event.key === 'z' && event.shiftKey) ||
			(event.ctrlKey && event.key === 'y')
		) {
			event.preventDefault();
			if ($canRedo) {
				redo();
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="history-panel">
	<h3>History</h3>
	
	<div class="controls">
		<button 
			on:click={undo} 
			disabled={!$canUndo}
			title="Undo (⌘Z)"
			aria-label="Undo"
		>
			← Undo
		</button>
		
		<button 
			on:click={redo} 
			disabled={!$canRedo}
			title="Redo (⌘⇧Z)"
			aria-label="Redo"
		>
			Redo →
		</button>
	</div>

	<div class="stats">
		<div class="stat">
			<span class="label">Events:</span>
			<span class="value">{$historyStats.totalEvents}</span>
		</div>
		<div class="stat">
			<span class="label">Position:</span>
			<span class="value">{$historyStats.currentIndex + 1} / {$historyStats.totalEvents}</span>
		</div>
		<div class="stat">
			<span class="label">Undo Steps:</span>
			<span class="value">{$historyStats.undoSteps}</span>
		</div>
		<div class="stat">
			<span class="label">Redo Steps:</span>
			<span class="value">{$historyStats.redoSteps}</span>
		</div>
	</div>
</div>

<style>
	.history-panel {
		padding: 1.5rem;
		background: #fff;
		border: 2px solid #28a745;
		border-radius: 8px;
	}

	h3 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #28a745;
	}

	.controls {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	button {
		flex: 1;
		padding: 0.5rem 1rem;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	button:hover:not(:disabled) {
		background: #218838;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.stats {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
		font-size: 0.85rem;
	}

	.stat {
		display: flex;
		justify-content: space-between;
	}

	.label {
		color: #666;
	}

	.value {
		font-weight: 600;
		color: #333;
	}
</style>

