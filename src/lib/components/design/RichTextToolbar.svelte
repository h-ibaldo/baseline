<script lang="ts">
  import { Editor } from '@tiptap/core';

  export let editor: Editor | null = null;

  function toggleBold() {
    editor?.chain().focus().toggleBold().run();
  }

  function toggleItalic() {
    editor?.chain().focus().toggleItalic().run();
  }

  function toggleUnderline() {
    editor?.chain().focus().toggleUnderline().run();
  }

  function toggleStrike() {
    editor?.chain().focus().toggleStrike().run();
  }

  function toggleCode() {
    editor?.chain().focus().toggleCode().run();
  }

  function toggleHeading(level: number) {
    editor?.chain().focus().toggleHeading({ level }).run();
  }

  function toggleBulletList() {
    editor?.chain().focus().toggleBulletList().run();
  }

  function toggleOrderedList() {
    editor?.chain().focus().toggleOrderedList().run();
  }

  function toggleBlockquote() {
    editor?.chain().focus().toggleBlockquote().run();
  }

  function toggleCodeBlock() {
    editor?.chain().focus().toggleCodeBlock().run();
  }

  function setTextAlign(alignment: 'left' | 'center' | 'right' | 'justify') {
    editor?.chain().focus().setTextAlign(alignment).run();
  }

  function insertHorizontalRule() {
    editor?.chain().focus().setHorizontalRule().run();
  }

  function setLink() {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }

  function unsetLink() {
    editor?.chain().focus().unsetLink().run();
  }

  function undo() {
    editor?.chain().focus().undo().run();
  }

  function redo() {
    editor?.chain().focus().redo().run();
  }
</script>

{#if editor}
  <div class="toolbar">
    <!-- History -->
    <button
      type="button"
      on:click={undo}
      disabled={!editor.can().undo()}
      class="toolbar-button"
      title="Undo"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    </button>

    <button
      type="button"
      on:click={redo}
      disabled={!editor.can().redo()}
      class="toolbar-button"
      title="Redo"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
      </svg>
    </button>

    <div class="separator"></div>

    <!-- Text Formatting -->
    <button
      type="button"
      on:click={toggleBold}
      class="toolbar-button"
      class:is-active={editor.isActive('bold')}
      title="Bold"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
      </svg>
    </button>

    <button
      type="button"
      on:click={toggleItalic}
      class="toolbar-button"
      class:is-active={editor.isActive('italic')}
      title="Italic"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4M8 20h4M12 4l-2 16" />
      </svg>
    </button>

    <button
      type="button"
      on:click={toggleUnderline}
      class="toolbar-button"
      class:is-active={editor.isActive('underline')}
      title="Underline"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m0-16H8m4 0h4" />
      </svg>
    </button>

    <button
      type="button"
      on:click={toggleStrike}
      class="toolbar-button"
      class:is-active={editor.isActive('strike')}
      title="Strikethrough"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l6 0" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v6m0 6v6" />
      </svg>
    </button>

    <button
      type="button"
      on:click={toggleCode}
      class="toolbar-button"
      class:is-active={editor.isActive('code')}
      title="Inline Code"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    </button>

    <div class="separator"></div>

    <!-- Headings -->
    <button
      type="button"
      on:click={() => toggleHeading(1)}
      class="toolbar-button"
      class:is-active={editor.isActive('heading', { level: 1 })}
      title="Heading 1"
    >
      H1
    </button>

    <button
      type="button"
      on:click={() => toggleHeading(2)}
      class="toolbar-button"
      class:is-active={editor.isActive('heading', { level: 2 })}
      title="Heading 2"
    >
      H2
    </button>

    <button
      type="button"
      on:click={() => toggleHeading(3)}
      class="toolbar-button"
      class:is-active={editor.isActive('heading', { level: 3 })}
      title="Heading 3"
    >
      H3
    </button>

    <div class="separator"></div>

    <!-- Lists -->
    <button
      type="button"
      on:click={toggleBulletList}
      class="toolbar-button"
      class:is-active={editor.isActive('bulletList')}
      title="Bullet List"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    </button>

    <button
      type="button"
      on:click={toggleOrderedList}
      class="toolbar-button"
      class:is-active={editor.isActive('orderedList')}
      title="Numbered List"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    </button>

    <div class="separator"></div>

    <!-- Block Elements -->
    <button
      type="button"
      on:click={toggleBlockquote}
      class="toolbar-button"
      class:is-active={editor.isActive('blockquote')}
      title="Quote"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>

    <button
      type="button"
      on:click={toggleCodeBlock}
      class="toolbar-button"
      class:is-active={editor.isActive('codeBlock')}
      title="Code Block"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    </button>

    <button
      type="button"
      on:click={insertHorizontalRule}
      class="toolbar-button"
      title="Horizontal Rule"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
    </button>

    <div class="separator"></div>

    <!-- Text Alignment -->
    <button
      type="button"
      on:click={() => setTextAlign('left')}
      class="toolbar-button"
      class:is-active={editor.isActive({ textAlign: 'left' })}
      title="Align Left"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    </button>

    <button
      type="button"
      on:click={() => setTextAlign('center')}
      class="toolbar-button"
      class:is-active={editor.isActive({ textAlign: 'center' })}
      title="Align Center"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M8 10h8M4 14h16M8 18h8" />
      </svg>
    </button>

    <button
      type="button"
      on:click={() => setTextAlign('right')}
      class="toolbar-button"
      class:is-active={editor.isActive({ textAlign: 'right' })}
      title="Align Right"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M12 10h8M4 14h16M12 18h8" />
      </svg>
    </button>

    <div class="separator"></div>

    <!-- Links -->
    <button
      type="button"
      on:click={editor.isActive('link') ? unsetLink : setLink}
      class="toolbar-button"
      class:is-active={editor.isActive('link')}
      title="Link"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </button>
  </div>
{/if}

<style>
  .toolbar {
    @apply flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50 rounded-t-lg;
  }

  .toolbar-button {
    @apply px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .toolbar-button.is-active {
    @apply bg-blue-100 border-blue-300 text-blue-700;
  }

  .separator {
    @apply w-px h-6 bg-gray-300 mx-1;
  }
</style>
