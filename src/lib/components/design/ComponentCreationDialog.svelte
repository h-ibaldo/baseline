<script lang="ts">
  import { onMount } from 'svelte';
  import type { CanvasElement } from '$lib/types/canvas';
  import { convertSelectionToComponent } from '$lib/stores/design-store';

  export let isOpen: boolean = false;
  export let onClose: () => void;
  export let onCreate: (componentData: {
    name: string;
    description: string;
    category: string;
    elements: CanvasElement[];
  }) => void;

  let name = '';
  let description = '';
  let category = 'custom';
  let elements: CanvasElement[] = [];
  let loading = false;
  let error = '';

  const categories = [
    { value: 'custom', label: 'Custom', icon: '🧩' },
    { value: 'text', label: 'Text', icon: '📝' },
    { value: 'image', label: 'Image', icon: '🖼️' },
    { value: 'button', label: 'Button', icon: '🔘' },
    { value: 'card', label: 'Card', icon: '🃏' },
    { value: 'hero', label: 'Hero', icon: '🎯' },
    { value: 'navigation', label: 'Navigation', icon: '🧭' },
    { value: 'form', label: 'Form', icon: '📋' },
    { value: 'layout', label: 'Layout', icon: '📐' },
  ];

  onMount(() => {
    if (isOpen) {
      loadSelection();
    }
  });

  $: if (isOpen) {
    loadSelection();
  }

  function loadSelection() {
    const selection = convertSelectionToComponent();
    if (selection) {
      elements = selection.elements;
      // Generate a default name based on element types
      const elementTypes = [...new Set(elements.map(el => el.type))];
      name = elementTypes.length === 1 
        ? `${elementTypes[0].charAt(0).toUpperCase() + elementTypes[0].slice(1)} Component`
        : 'Multi-Element Component';
    } else {
      elements = [];
    }
  }

  function handleCreate() {
    if (!name.trim()) {
      error = 'Please enter a component name';
      return;
    }

    if (elements.length === 0) {
      error = 'No elements selected for component';
      return;
    }

    loading = true;
    error = '';

    onCreate({
      name: name.trim(),
      description: description.trim(),
      category,
      elements
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'Enter' && !loading) {
      handleCreate();
    }
  }

  function getCategoryIcon(categoryValue: string): string {
    const categoryObj = categories.find(c => c.value === categoryValue);
    return categoryObj?.icon || '🧩';
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop -->
  <div class="modal-backdrop" on:click={onClose}></div>

  <!-- Dialog -->
  <div class="component-dialog">
    <div class="dialog-header">
      <h3 class="dialog-title">Create Component</h3>
      <button
        type="button"
        on:click={onClose}
        class="close-button"
        title="Close"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="dialog-content">
      <!-- Selection Preview -->
      <div class="selection-preview">
        <h4 class="preview-title">Selected Elements</h4>
        {#if elements.length > 0}
          <div class="elements-list">
            {#each elements as element (element.id)}
              <div class="element-item">
                <span class="element-type">{element.type}</span>
                <span class="element-id">#{element.id.slice(-6)}</span>
              </div>
            {/each}
          </div>
        {:else}
          <div class="no-selection">
            <div class="no-selection-icon">⚠️</div>
            <p>No elements selected. Please select elements in the canvas first.</p>
          </div>
        {/if}
      </div>

      <!-- Component Details -->
      <div class="component-details">
        <div class="form-group">
          <label for="component-name" class="form-label">
            Component Name
            <span class="required">*</span>
          </label>
          <input
            id="component-name"
            type="text"
            bind:value={name}
            placeholder="Enter component name"
            class="form-input"
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="component-description" class="form-label">
            Description
          </label>
          <textarea
            id="component-description"
            bind:value={description}
            placeholder="Describe what this component does"
            class="form-textarea"
            rows="3"
            disabled={loading}
          ></textarea>
        </div>

        <div class="form-group">
          <label for="component-category" class="form-label">
            Category
          </label>
          <select
            id="component-category"
            bind:value={category}
            class="form-select"
            disabled={loading}
          >
            {#each categories as cat}
              <option value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Error Message -->
      {#if error}
        <div class="error-message">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      {/if}
    </div>

    <div class="dialog-actions">
      <button
        type="button"
        on:click={onClose}
        class="cancel-button"
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="button"
        on:click={handleCreate}
        class="create-button"
        disabled={loading || elements.length === 0}
      >
        {#if loading}
          <div class="loading-spinner"></div>
          Creating...
        {:else}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Component
        {/if}
      </button>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    @apply fixed inset-0 bg-black bg-opacity-50 z-50;
  }

  .component-dialog {
    @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-lg shadow-xl z-50;
  }

  .dialog-header {
    @apply flex items-center justify-between p-6 border-b border-gray-200;
  }

  .dialog-title {
    @apply text-lg font-semibold text-gray-900;
  }

  .close-button {
    @apply p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded;
  }

  .dialog-content {
    @apply p-6 space-y-6;
  }

  .selection-preview {
    @apply space-y-3;
  }

  .preview-title {
    @apply text-sm font-medium text-gray-700;
  }

  .elements-list {
    @apply space-y-2;
  }

  .element-item {
    @apply flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg;
  }

  .element-type {
    @apply text-sm font-medium text-gray-900 capitalize;
  }

  .element-id {
    @apply text-xs text-gray-500 font-mono;
  }

  .no-selection {
    @apply flex flex-col items-center justify-center py-8 text-center;
  }

  .no-selection-icon {
    @apply text-4xl mb-2;
  }

  .no-selection p {
    @apply text-sm text-gray-500;
  }

  .component-details {
    @apply space-y-4;
  }

  .form-group {
    @apply space-y-2;
  }

  .form-label {
    @apply block text-sm font-medium text-gray-700;
  }

  .required {
    @apply text-red-500;
  }

  .form-input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .form-textarea {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none;
  }

  .form-select {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .error-message {
    @apply flex items-center gap-2 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm;
  }

  .dialog-actions {
    @apply flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg;
  }

  .cancel-button {
    @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .create-button {
    @apply flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .loading-spinner {
    @apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin;
  }
</style>
