<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Heading from '@tiptap/extension-heading';
  import Bold from '@tiptap/extension-bold';
  import Italic from '@tiptap/extension-italic';
  import Code from '@tiptap/extension-code';
  import BulletList from '@tiptap/extension-bullet-list';
  import OrderedList from '@tiptap/extension-ordered-list';
  import ListItem from '@tiptap/extension-list-item';
  import Blockquote from '@tiptap/extension-blockquote';
  import CodeBlock from '@tiptap/extension-code-block';
  import HorizontalRule from '@tiptap/extension-horizontal-rule';
  import Link from '@tiptap/extension-link';
  import Image from '@tiptap/extension-image';
  import Table from '@tiptap/extension-table';
  import TableRow from '@tiptap/extension-table-row';
  import TableCell from '@tiptap/extension-table-cell';
  import TableHeader from '@tiptap/extension-table-header';
  import History from '@tiptap/extension-history';
  import Placeholder from '@tiptap/extension-placeholder';

  export let content: string = '';
  export let placeholder: string = 'Start writing...';
  export let editable: boolean = true;
  export let minHeight: string = '200px';
  export let maxHeight: string = 'none';

  const dispatch = createEventDispatcher();

  let editor: Editor | null = null;
  let editorElement: HTMLDivElement;

  onMount(() => {
    editor = new Editor({
      element: editorElement,
      extensions: [
        StarterKit,
        Heading.configure({
          levels: [1, 2, 3, 4, 5, 6],
        }),
        Bold,
        Italic,
        Code,
        BulletList,
        OrderedList,
        ListItem,
        Blockquote,
        CodeBlock,
        HorizontalRule,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-600 underline hover:text-blue-800',
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'max-w-full h-auto rounded-lg',
          },
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        History,
        Placeholder.configure({
          placeholder,
        }),
      ],
      content,
      editable,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        dispatch('update', { content: html });
      },
      onSelectionUpdate: ({ editor }) => {
        dispatch('selectionUpdate', {
          selection: editor.state.selection,
          isActive: (name: string, attrs?: Record<string, any>) => editor.isActive(name, attrs),
        });
      },
    });

    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });

  // Update content when prop changes
  $: if (editor && content !== editor.getHTML()) {
    editor.commands.setContent(content, false);
  }

  // Update editable when prop changes
  $: if (editor) {
    editor.setEditable(editable);
  }

  function insertImage(src: string, alt?: string) {
    if (editor) {
      editor.chain().focus().setImage({ src, alt }).run();
    }
  }

  function insertLink(href: string, text?: string) {
    if (editor) {
      editor.chain().focus().setLink({ href }).insertContent(text || href).run();
    }
  }

  function insertTable(rows: number = 3, cols: number = 3) {
    if (editor) {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    }
  }

  function insertHorizontalRule() {
    if (editor) {
      editor.chain().focus().setHorizontalRule().run();
    }
  }

  function insertCodeBlock() {
    if (editor) {
      editor.chain().focus().setCodeBlock().run();
    }
  }

  function insertBlockquote() {
    if (editor) {
      editor.chain().focus().setBlockquote().run();
    }
  }

  function insertBulletList() {
    if (editor) {
      editor.chain().focus().toggleBulletList().run();
    }
  }

  function insertOrderedList() {
    if (editor) {
      editor.chain().focus().toggleOrderedList().run();
    }
  }

  function setHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
    if (editor) {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  }

  function setParagraph() {
    if (editor) {
      editor.chain().focus().setParagraph().run();
    }
  }

  function toggleBold() {
    if (editor) {
      editor.chain().focus().toggleBold().run();
    }
  }

  function toggleItalic() {
    if (editor) {
      editor.chain().focus().toggleItalic().run();
    }
  }

  function toggleCode() {
    if (editor) {
      editor.chain().focus().toggleCode().run();
    }
  }

  function undo() {
    if (editor) {
      editor.chain().focus().undo().run();
    }
  }

  function redo() {
    if (editor) {
      editor.chain().focus().redo().run();
    }
  }

  function clearFormatting() {
    if (editor) {
      editor.chain().focus().clearNodes().unsetAllMarks().run();
    }
  }

  // Expose methods for parent components
  export { insertImage, insertLink, insertTable, insertHorizontalRule, insertCodeBlock, insertBlockquote, insertBulletList, insertOrderedList, setHeading, setParagraph, toggleBold, toggleItalic, toggleCode, undo, redo, clearFormatting };
</script>

<div 
  class="rich-text-editor"
  style="min-height: {minHeight}; max-height: {maxHeight};"
>
  <div 
    bind:this={editorElement}
    class="editor-content"
  ></div>
</div>

<style>
  .rich-text-editor {
    @apply border border-gray-300 rounded-lg overflow-hidden;
  }

  .editor-content {
    @apply p-4 focus:outline-none;
  }

  .editor-content :global(.ProseMirror) {
    @apply outline-none;
  }

  .editor-content :global(.ProseMirror p.is-editor-empty:first-child::before) {
    @apply text-gray-400 float-left h-0 pointer-events-none;
  }

  .editor-content :global(.ProseMirror h1) {
    @apply text-3xl font-bold text-gray-900 mb-4;
  }

  .editor-content :global(.ProseMirror h2) {
    @apply text-2xl font-bold text-gray-900 mb-3;
  }

  .editor-content :global(.ProseMirror h3) {
    @apply text-xl font-semibold text-gray-900 mb-2;
  }

  .editor-content :global(.ProseMirror h4) {
    @apply text-lg font-semibold text-gray-900 mb-2;
  }

  .editor-content :global(.ProseMirror h5) {
    @apply text-base font-semibold text-gray-900 mb-1;
  }

  .editor-content :global(.ProseMirror h6) {
    @apply text-sm font-semibold text-gray-900 mb-1;
  }

  .editor-content :global(.ProseMirror p) {
    @apply text-gray-700 mb-2 leading-relaxed;
  }

  .editor-content :global(.ProseMirror strong) {
    @apply font-semibold;
  }

  .editor-content :global(.ProseMirror em) {
    @apply italic;
  }

  .editor-content :global(.ProseMirror code) {
    @apply bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono;
  }

  .editor-content :global(.ProseMirror pre) {
    @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4;
  }

  .editor-content :global(.ProseMirror pre code) {
    @apply bg-transparent text-gray-100 p-0;
  }

  .editor-content :global(.ProseMirror blockquote) {
    @apply border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4;
  }

  .editor-content :global(.ProseMirror ul) {
    @apply list-disc list-inside mb-4 space-y-1;
  }

  .editor-content :global(.ProseMirror ol) {
    @apply list-decimal list-inside mb-4 space-y-1;
  }

  .editor-content :global(.ProseMirror li) {
    @apply text-gray-700;
  }

  .editor-content :global(.ProseMirror hr) {
    @apply border-t border-gray-300 my-6;
  }

  .editor-content :global(.ProseMirror a) {
    @apply text-blue-600 underline hover:text-blue-800;
  }

  .editor-content :global(.ProseMirror img) {
    @apply max-w-full h-auto rounded-lg my-4;
  }

  .editor-content :global(.ProseMirror table) {
    @apply border-collapse table-auto w-full mb-4;
  }

  .editor-content :global(.ProseMirror th) {
    @apply border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left;
  }

  .editor-content :global(.ProseMirror td) {
    @apply border border-gray-300 px-4 py-2;
  }

  .editor-content :global(.ProseMirror .selectedCell) {
    @apply bg-blue-50;
  }
</style>
