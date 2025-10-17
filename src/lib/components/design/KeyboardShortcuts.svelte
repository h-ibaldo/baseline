<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let isOpen: boolean = false;

  const dispatch = createEventDispatcher();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      dispatch('close');
    }
  }

  const shortcuts = [
    {
      category: 'General',
      items: [
        { key: 'Ctrl + S', description: 'Save page' },
        { key: 'Ctrl + Z', description: 'Undo' },
        { key: 'Ctrl + Shift + Z', description: 'Redo' },
        { key: 'Ctrl + N', description: 'New page' },
        { key: 'Ctrl + A', description: 'Select all' },
        { key: 'Ctrl + C', description: 'Copy' },
        { key: 'Ctrl + V', description: 'Paste' },
        { key: 'Delete', description: 'Delete selected' },
        { key: 'Escape', description: 'Close dialogs' },
      ]
    },
    {
      category: 'Canvas',
      items: [
        { key: 'Space + Drag', description: 'Pan canvas' },
        { key: 'Ctrl + Mouse Wheel', description: 'Zoom in/out' },
        { key: 'Ctrl + 0', description: 'Reset zoom' },
        { key: 'Ctrl + 1', description: 'Fit to screen' },
        { key: 'Tab', description: 'Next element' },
        { key: 'Shift + Tab', description: 'Previous element' },
        { key: 'Arrow Keys', description: 'Move selected elements' },
        { key: 'Shift + Arrow Keys', description: 'Move by 10px' },
      ]
    },
    {
      category: 'Elements',
      items: [
        { key: 'Ctrl + D', description: 'Duplicate selected' },
        { key: 'Ctrl + G', description: 'Group selected' },
        { key: 'Ctrl + Shift + G', description: 'Ungroup' },
        { key: 'Ctrl + [', description: 'Send backward' },
        { key: 'Ctrl + ]', description: 'Bring forward' },
        { key: 'Ctrl + Shift + [', description: 'Send to back' },
        { key: 'Ctrl + Shift + ]', description: 'Bring to front' },
        { key: 'Ctrl + Shift + C', description: 'Convert to component' },
      ]
    },
    {
      category: 'Publishing',
      items: [
        { key: 'Ctrl + P', description: 'Publish page' },
        { key: 'Ctrl + Shift + P', description: 'Unpublish page' },
        { key: 'Ctrl + E', description: 'Export theme' },
        { key: 'Ctrl + I', description: 'Import theme' },
      ]
    },
    {
      category: 'Navigation',
      items: [
        { key: 'Ctrl + 1-9', description: 'Switch to page 1-9' },
        { key: 'Ctrl + Left/Right', description: 'Previous/Next page' },
        { key: 'Ctrl + T', description: 'Toggle page manager' },
        { key: 'Ctrl + B', description: 'Toggle component library' },
        { key: 'F11', description: 'Toggle fullscreen' },
      ]
    }
  ];
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop -->
  <div 
    class="shortcuts-backdrop" 
    on:click={() => dispatch('close')}
  ></div>

  <!-- Shortcuts Modal -->
  <div class="shortcuts-modal">
    <div class="modal-header">
      <h2 class="modal-title">Keyboard Shortcuts</h2>
      <button
        type="button"
        class="close-button"
        on:click={() => dispatch('close')}
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="modal-content">
      {#each shortcuts as category}
        <div class="shortcut-category">
          <h3 class="category-title">{category.category}</h3>
          <div class="shortcut-list">
            {#each category.items as shortcut}
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  {#each shortcut.key.split(' + ') as key, i}
                    <kbd class="key">{key}</kbd>
                    {#if i < shortcut.key.split(' + ').length - 1}
                      <span class="key-separator">+</span>
                    {/if}
                  {/each}
                </div>
                <div class="shortcut-description">{shortcut.description}</div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="modal-footer">
      <button
        type="button"
        class="close-modal-button"
        on:click={() => dispatch('close')}
      >
        Close
      </button>
    </div>
  </div>
{/if}

<style>
  .shortcuts-backdrop {
    @apply fixed inset-0 bg-black bg-opacity-50 z-50;
  }

  .shortcuts-modal {
    @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-4xl max-h-[80vh] overflow-hidden;
  }

  .modal-header {
    @apply flex items-center justify-between p-6 border-b border-gray-200;
  }

  .modal-title {
    @apply text-xl font-semibold text-gray-900;
  }

  .close-button {
    @apply p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded;
  }

  .modal-content {
    @apply p-6 overflow-y-auto max-h-96;
  }

  .shortcut-category {
    @apply mb-8 last:mb-0;
  }

  .category-title {
    @apply text-lg font-semibold text-gray-900 mb-4;
  }

  .shortcut-list {
    @apply space-y-3;
  }

  .shortcut-item {
    @apply flex items-center justify-between py-2;
  }

  .shortcut-keys {
    @apply flex items-center gap-1;
  }

  .key {
    @apply px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded border border-gray-300;
  }

  .key-separator {
    @apply text-gray-500 mx-1;
  }

  .shortcut-description {
    @apply text-sm text-gray-600;
  }

  .modal-footer {
    @apply flex justify-end p-6 border-t border-gray-200 bg-gray-50;
  }

  .close-modal-button {
    @apply px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
</style>
