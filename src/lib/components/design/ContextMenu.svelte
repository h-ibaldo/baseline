<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let isOpen: boolean = false;
  export let x: number = 0;
  export let y: number = 0;
  export let target: 'page' | 'element' | 'canvas' = 'canvas';
  export let selectedElementIds: string[] = [];
  export let currentPage: any = null;

  const dispatch = createEventDispatcher();

  function handleAction(action: string) {
    dispatch('action', { action, target, selectedElementIds, currentPage });
    dispatch('close');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      dispatch('close');
    }
  }

  // Calculate menu position to stay within viewport
  $: menuStyle = `
    position: fixed;
    left: ${Math.min(x, window.innerWidth - 200)}px;
    top: ${Math.min(y, window.innerHeight - 300)}px;
    z-index: 1000;
  `;
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop -->
  <div 
    class="context-menu-backdrop" 
    on:click={() => dispatch('close')}
    on:contextmenu|preventDefault={() => dispatch('close')}
  ></div>

  <!-- Context Menu -->
  <div class="context-menu" style={menuStyle}>
    {#if target === 'page'}
      <!-- Page Context Menu -->
      <div class="menu-section">
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('publish')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Publish Page
        </button>
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('unpublish')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
          Unpublish Page
        </button>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('duplicate')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Duplicate Page
        </button>
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('edit')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Page
        </button>
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('toggle-blog-template')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {currentPage?.isBlogTemplate ? 'Remove Blog Template' : 'Mark as Blog Template'}
        </button>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <button
          type="button"
          class="menu-item danger"
          on:click={() => handleAction('delete')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Page
        </button>
      </div>

    {:else if target === 'element'}
      <!-- Element Context Menu -->
      <div class="menu-section">
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('convert-to-component')}
          disabled={selectedElementIds.length === 0}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Convert to Component
        </button>
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('duplicate')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Duplicate
        </button>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('bring-to-front')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          Bring to Front
        </button>
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('send-to-back')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
          Send to Back
        </button>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('copy')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('paste')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Paste
        </button>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <button
          type="button"
          class="menu-item danger"
          on:click={() => handleAction('delete')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>

    {:else}
      <!-- Canvas Context Menu -->
      <div class="menu-section">
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('new-page')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Page
        </button>
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('paste')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Paste
        </button>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-section">
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('select-all')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Select All
        </button>
        <button
          type="button"
          class="menu-item"
          on:click={() => handleAction('deselect-all')}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Deselect All
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .context-menu-backdrop {
    @apply fixed inset-0 z-40;
  }

  .context-menu {
    @apply bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48 max-w-64;
  }

  .menu-section {
    @apply px-1;
  }

  .menu-item {
    @apply w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .menu-item.danger {
    @apply text-red-600 hover:bg-red-50 focus:bg-red-50;
  }

  .menu-divider {
    @apply h-px bg-gray-200 my-1;
  }
</style>
