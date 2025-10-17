<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let isActive: (name: string, attrs?: Record<string, any>) => boolean = () => false;
  export let canUndo: boolean = false;
  export let canRedo: boolean = false;

  const dispatch = createEventDispatcher();

  function handleAction(action: string, ...args: any[]) {
    dispatch('action', { action, args });
  }

  function handleHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
    handleAction('setHeading', level);
  }

  function handleInsert(type: string, ...args: any[]) {
    handleAction(`insert${type}`, ...args);
  }
</script>

<div class="rich-text-toolbar">
  <!-- History Controls -->
  <div class="toolbar-group">
    <button
      type="button"
      class="toolbar-button"
      class:disabled={!canUndo}
      on:click={() => handleAction('undo')}
      title="Undo (Ctrl+Z)"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    </button>
    <button
      type="button"
      class="toolbar-button"
      class:disabled={!canRedo}
      on:click={() => handleAction('redo')}
      title="Redo (Ctrl+Y)"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
      </svg>
    </button>
  </div>

  <div class="toolbar-separator"></div>

  <!-- Text Formatting -->
  <div class="toolbar-group">
    <button
      type="button"
      class="toolbar-button"
      class:active={isActive('paragraph')}
      on:click={() => handleAction('setParagraph')}
      title="Paragraph"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    </button>
    
    <div class="toolbar-dropdown">
      <button
        type="button"
        class="toolbar-button"
        title="Headings"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8M4 18h4" />
        </svg>
        <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div class="toolbar-dropdown-menu">
        <button
          type="button"
          class="dropdown-item"
          class:active={isActive('heading', { level: 1 })}
          on:click={() => handleHeading(1)}
        >
          <span class="text-lg font-bold">H1</span>
          <span>Heading 1</span>
        </button>
        <button
          type="button"
          class="dropdown-item"
          class:active={isActive('heading', { level: 2 })}
          on:click={() => handleHeading(2)}
        >
          <span class="text-base font-bold">H2</span>
          <span>Heading 2</span>
        </button>
        <button
          type="button"
          class="dropdown-item"
          class:active={isActive('heading', { level: 3 })}
          on:click={() => handleHeading(3)}
        >
          <span class="text-sm font-bold">H3</span>
          <span>Heading 3</span>
        </button>
        <button
          type="button"
          class="dropdown-item"
          class:active={isActive('heading', { level: 4 })}
          on:click={() => handleHeading(4)}
        >
          <span class="text-xs font-bold">H4</span>
          <span>Heading 4</span>
        </button>
      </div>
    </div>
  </div>

  <div class="toolbar-separator"></div>

  <!-- Text Styles -->
  <div class="toolbar-group">
    <button
      type="button"
      class="toolbar-button"
      class:active={isActive('bold')}
      on:click={() => handleAction('toggleBold')}
      title="Bold (Ctrl+B)"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
      </svg>
    </button>
    <button
      type="button"
      class="toolbar-button"
      class:active={isActive('italic')}
      on:click={() => handleAction('toggleItalic')}
      title="Italic (Ctrl+I)"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h6M8 12h8M10 20h6" />
      </svg>
    </button>
    <button
      type="button"
      class="toolbar-button"
      class:active={isActive('code')}
      on:click={() => handleAction('toggleCode')}
      title="Code (Ctrl+E)"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    </button>
  </div>

  <div class="toolbar-separator"></div>

  <!-- Lists -->
  <div class="toolbar-group">
    <button
      type="button"
      class="toolbar-button"
      class:active={isActive('bulletList')}
      on:click={() => handleAction('insertBulletList')}
      title="Bullet List"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    </button>
    <button
      type="button"
      class="toolbar-button"
      class:active={isActive('orderedList')}
      on:click={() => handleAction('insertOrderedList')}
      title="Numbered List"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    </button>
  </div>

  <div class="toolbar-separator"></div>

  <!-- Block Elements -->
  <div class="toolbar-group">
    <button
      type="button"
      class="toolbar-button"
      class:active={isActive('blockquote')}
      on:click={() => handleInsert('Blockquote')}
      title="Quote"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>
    <button
      type="button"
      class="toolbar-button"
      class:active={isActive('codeBlock')}
      on:click={() => handleInsert('CodeBlock')}
      title="Code Block"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    </button>
    <button
      type="button"
      class="toolbar-button"
      on:click={() => handleInsert('HorizontalRule')}
      title="Horizontal Rule"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
    </button>
  </div>

  <div class="toolbar-separator"></div>

  <!-- Insert Elements -->
  <div class="toolbar-group">
    <button
      type="button"
      class="toolbar-button"
      on:click={() => handleInsert('Table', 3, 3)}
      title="Insert Table"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0V4a2 2 0 012-2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    </button>
    <button
      type="button"
      class="toolbar-button"
      on:click={() => handleInsert('Image')}
      title="Insert Image"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </button>
    <button
      type="button"
      class="toolbar-button"
      on:click={() => handleInsert('Link')}
      title="Insert Link"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </button>
  </div>

  <div class="toolbar-separator"></div>

  <!-- Clear Formatting -->
  <div class="toolbar-group">
    <button
      type="button"
      class="toolbar-button"
      on:click={() => handleAction('clearFormatting')}
      title="Clear Formatting"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>

<style>
  .rich-text-toolbar {
    @apply flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto;
  }

  .toolbar-group {
    @apply flex items-center gap-1;
  }

  .toolbar-separator {
    @apply w-px h-6 bg-gray-300 mx-1;
  }

  .toolbar-button {
    @apply flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .toolbar-button.active {
    @apply text-blue-600 bg-blue-100;
  }

  .toolbar-dropdown {
    @apply relative;
  }

  .toolbar-dropdown-menu {
    @apply absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48 hidden;
  }

  .toolbar-dropdown:hover .toolbar-dropdown-menu {
    @apply block;
  }

  .dropdown-item {
    @apply flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg;
  }

  .dropdown-item.active {
    @apply bg-blue-50 text-blue-700;
  }

  .dropdown-item span:first-child {
    @apply w-8 text-center;
  }
</style>