<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Placeholder from '@tiptap/extension-placeholder';
  import Link from '@tiptap/extension-link';
  import Image from '@tiptap/extension-image';
  import TextAlign from '@tiptap/extension-text-align';
  import Color from '@tiptap/extension-color';
  import TextStyle from '@tiptap/extension-text-style';
  import Heading from '@tiptap/extension-heading';
  import BulletList from '@tiptap/extension-bullet-list';
  import OrderedList from '@tiptap/extension-ordered-list';
  import Blockquote from '@tiptap/extension-blockquote';
  import Code from '@tiptap/extension-code';
  import CodeBlock from '@tiptap/extension-code-block';
  import HorizontalRule from '@tiptap/extension-horizontal-rule';
  import HardBreak from '@tiptap/extension-hard-break';
  import History from '@tiptap/extension-history';
  import Underline from '@tiptap/extension-underline';
  import Strike from '@tiptap/extension-strike';
  import Italic from '@tiptap/extension-italic';
  import Bold from '@tiptap/extension-bold';
  import Highlight from '@tiptap/extension-highlight';
  import Subscript from '@tiptap/extension-subscript';
  import Superscript from '@tiptap/extension-superscript';
  import Typography from '@tiptap/extension-typography';

  export let content: string = '';
  export let placeholder: string = 'Start writing...';
  export let editable: boolean = true;
  export let class: string = '';
  export let onUpdate: ((content: string) => void) | undefined = undefined;

  let editor: Editor | null = null;
  let editorElement: HTMLDivElement;

  onMount(() => {
    editor = new Editor({
      element: editorElement,
      extensions: [
        StarterKit.configure({
          // Disable default heading to use custom one
          heading: false,
        }),
        Heading.configure({
          levels: [1, 2, 3, 4, 5, 6],
        }),
        Placeholder.configure({
          placeholder,
        }),
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
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Color.configure({}),
        TextStyle.configure({}),
        BulletList.configure({
          HTMLAttributes: {
            class: 'list-disc list-inside space-y-1',
          },
        }),
        OrderedList.configure({
          HTMLAttributes: {
            class: 'list-decimal list-inside space-y-1',
          },
        }),
        Blockquote.configure({
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic text-gray-700',
          },
        }),
        Code.configure({
          HTMLAttributes: {
            class: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
          },
        }),
        CodeBlock.configure({
          HTMLAttributes: {
            class: 'bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto',
          },
        }),
        HorizontalRule.configure({
          HTMLAttributes: {
            class: 'my-8 border-t border-gray-300',
          },
        }),
        HardBreak,
        History,
        Underline,
        Strike,
        Italic,
        Bold,
        Highlight.configure({
          HTMLAttributes: {
            class: 'bg-yellow-200 px-1 rounded',
          },
        }),
        Subscript,
        Superscript,
        Typography,
      ],
      content,
      editable,
      onUpdate: ({ editor }) => {
        if (onUpdate) {
          onUpdate(editor.getHTML());
        }
      },
    });

    return () => {
      editor?.destroy();
    };
  });

  onDestroy(() => {
    editor?.destroy();
  });

  // Update content when prop changes
  $: if (editor && content !== editor.getHTML()) {
    editor.commands.setContent(content, false);
  }

  // Update editable when prop changes
  $: if (editor) {
    editor.setEditable(editable);
  }
</script>

<div class="rich-text-editor {class}">
  <div bind:this={editorElement} class="prose prose-sm max-w-none focus:outline-none"></div>
</div>

<style>
  .rich-text-editor {
    @apply w-full;
  }

  .rich-text-editor .ProseMirror {
    @apply outline-none min-h-[100px] p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
  }

  .rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
    @apply text-gray-400 float-left h-0 pointer-events-none;
    content: attr(data-placeholder);
  }

  .rich-text-editor .ProseMirror h1 {
    @apply text-3xl font-bold mb-4 mt-6;
  }

  .rich-text-editor .ProseMirror h2 {
    @apply text-2xl font-bold mb-3 mt-5;
  }

  .rich-text-editor .ProseMirror h3 {
    @apply text-xl font-bold mb-2 mt-4;
  }

  .rich-text-editor .ProseMirror h4 {
    @apply text-lg font-bold mb-2 mt-3;
  }

  .rich-text-editor .ProseMirror h5 {
    @apply text-base font-bold mb-1 mt-2;
  }

  .rich-text-editor .ProseMirror h6 {
    @apply text-sm font-bold mb-1 mt-2;
  }

  .rich-text-editor .ProseMirror p {
    @apply mb-3 leading-relaxed;
  }

  .rich-text-editor .ProseMirror ul {
    @apply mb-3;
  }

  .rich-text-editor .ProseMirror ol {
    @apply mb-3;
  }

  .rich-text-editor .ProseMirror blockquote {
    @apply mb-3;
  }

  .rich-text-editor .ProseMirror code {
    @apply text-sm;
  }

  .rich-text-editor .ProseMirror pre {
    @apply mb-3;
  }

  .rich-text-editor .ProseMirror img {
    @apply mb-3;
  }

  .rich-text-editor .ProseMirror hr {
    @apply my-6;
  }

  /* Toolbar styles */
  .rich-text-editor .toolbar {
    @apply flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50 rounded-t-lg;
  }

  .rich-text-editor .toolbar button {
    @apply px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .rich-text-editor .toolbar button.is-active {
    @apply bg-blue-100 border-blue-300 text-blue-700;
  }

  .rich-text-editor .toolbar .separator {
    @apply w-px h-6 bg-gray-300 mx-1;
  }
</style>
