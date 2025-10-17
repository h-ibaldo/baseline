<script lang="ts">
  export let page: {
    id: string;
    name: string;
    slug: string;
    status: 'draft' | 'published';
    isBlogTemplate: boolean;
    blogTemplateType?: string;
  };
  export let onPublish: (pageId: string, slug: string) => void;
  export let onUnpublish: (pageId: string) => void;
  export let onClose: () => void;

  let slug = page.slug || '';
  let isPublishing = false;
  let error = '';
  let success = '';

  function handlePublish() {
    if (!slug.trim()) {
      error = 'Please enter a slug for the page';
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug.trim())) {
      error = 'Slug must contain only lowercase letters, numbers, and hyphens';
      return;
    }

    isPublishing = true;
    error = '';
    success = '';

    onPublish(page.id, slug.trim());
  }

  function handleUnpublish() {
    isPublishing = true;
    error = '';
    success = '';

    onUnpublish(page.id);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'Enter' && page.status === 'draft') {
      handlePublish();
    }
  }

  function generateSlug() {
    const baseSlug = page.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    slug = baseSlug || 'page';
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Backdrop -->
<div class="modal-backdrop" on:click={onClose}></div>

<!-- Modal -->
<div class="publishing-panel">
  <div class="panel-header">
    <h3 class="panel-title">
      {page.status === 'published' ? 'Page Settings' : 'Publish Page'}
    </h3>
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

  <div class="panel-content">
    <!-- Page Info -->
    <div class="page-info">
      <div class="info-item">
        <label class="info-label">Page Name</label>
        <span class="info-value">{page.name}</span>
      </div>
      
      {#if page.isBlogTemplate}
        <div class="info-item">
          <label class="info-label">Type</label>
          <span class="info-value blog-template">
            📝 Blog Template
            {#if page.blogTemplateType}
              ({page.blogTemplateType})
            {/if}
          </span>
        </div>
      {/if}

      <div class="info-item">
        <label class="info-label">Status</label>
        <span class="info-value status-{page.status}">
          {page.status === 'published' ? '🌐 Published' : '📝 Draft'}
        </span>
      </div>
    </div>

    <!-- Slug Configuration -->
    <div class="slug-section">
      <label for="page-slug" class="slug-label">
        Page URL
        <span class="required">*</span>
      </label>
      <div class="slug-input-group">
        <span class="slug-prefix">/</span>
        <input
          id="page-slug"
          type="text"
          bind:value={slug}
          placeholder="page-slug"
          class="slug-input"
          disabled={isPublishing}
        />
        <button
          type="button"
          on:click={generateSlug}
          class="generate-button"
          disabled={isPublishing}
          title="Generate from page name"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <p class="slug-help">
        This will be the URL where your page is accessible. Use lowercase letters, numbers, and hyphens only.
      </p>
    </div>

    <!-- Publishing Options -->
    {#if page.status === 'draft'}
      <div class="publish-options">
        <h4 class="options-title">Publishing Options</h4>
        
        <div class="option-item">
          <label class="option-label">
            <input type="checkbox" checked disabled class="option-checkbox" />
            <span class="option-text">Make page publicly accessible</span>
          </label>
        </div>

        <div class="option-item">
          <label class="option-label">
            <input type="checkbox" checked disabled class="option-checkbox" />
            <span class="option-text">Include in sitemap</span>
          </label>
        </div>

        {#if page.isBlogTemplate}
          <div class="option-item">
            <label class="option-label">
              <input type="checkbox" checked disabled class="option-checkbox" />
              <span class="option-text">Enable blog content management</span>
            </label>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Error/Success Messages -->
    {#if error}
      <div class="message error">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </div>
    {/if}

    {#if success}
      <div class="message success">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {success}
      </div>
    {/if}
  </div>

  <!-- Panel Actions -->
  <div class="panel-actions">
    <button
      type="button"
      on:click={onClose}
      class="cancel-button"
      disabled={isPublishing}
    >
      Cancel
    </button>

    {#if page.status === 'published'}
      <button
        type="button"
        on:click={handleUnpublish}
        class="unpublish-button"
        disabled={isPublishing}
      >
        {#if isPublishing}
          <div class="loading-spinner"></div>
          Unpublishing...
        {:else}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
          Unpublish
        {/if}
      </button>
    {:else}
      <button
        type="button"
        on:click={handlePublish}
        class="publish-button"
        disabled={isPublishing || !slug.trim()}
      >
        {#if isPublishing}
          <div class="loading-spinner"></div>
          Publishing...
        {:else}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Publish Page
        {/if}
      </button>
    {/if}
  </div>
</div>

<style>
  .modal-backdrop {
    @apply fixed inset-0 bg-black bg-opacity-50 z-40;
  }

  .publishing-panel {
    @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50;
  }

  .panel-header {
    @apply flex items-center justify-between p-6 border-b border-gray-200;
  }

  .panel-title {
    @apply text-lg font-semibold text-gray-900;
  }

  .close-button {
    @apply p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded;
  }

  .panel-content {
    @apply p-6 space-y-6;
  }

  .page-info {
    @apply space-y-3;
  }

  .info-item {
    @apply flex items-center justify-between;
  }

  .info-label {
    @apply text-sm font-medium text-gray-700;
  }

  .info-value {
    @apply text-sm text-gray-900;
  }

  .info-value.blog-template {
    @apply text-blue-600;
  }

  .info-value.status-published {
    @apply text-green-600;
  }

  .info-value.status-draft {
    @apply text-gray-600;
  }

  .slug-section {
    @apply space-y-2;
  }

  .slug-label {
    @apply block text-sm font-medium text-gray-700;
  }

  .required {
    @apply text-red-500;
  }

  .slug-input-group {
    @apply flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500;
  }

  .slug-prefix {
    @apply px-3 py-2 text-gray-500 bg-gray-50 border-r border-gray-300 rounded-l-lg;
  }

  .slug-input {
    @apply flex-1 px-3 py-2 border-0 rounded-none focus:outline-none;
  }

  .generate-button {
    @apply p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .slug-help {
    @apply text-xs text-gray-500;
  }

  .publish-options {
    @apply space-y-3;
  }

  .options-title {
    @apply text-sm font-medium text-gray-700;
  }

  .option-item {
    @apply flex items-start;
  }

  .option-label {
    @apply flex items-center gap-2 cursor-pointer;
  }

  .option-checkbox {
    @apply rounded border-gray-300 text-blue-600 focus:ring-blue-500;
  }

  .option-text {
    @apply text-sm text-gray-700;
  }

  .message {
    @apply flex items-center gap-2 p-3 rounded-lg text-sm;
  }

  .message.error {
    @apply bg-red-50 text-red-800 border border-red-200;
  }

  .message.success {
    @apply bg-green-50 text-green-800 border border-green-200;
  }

  .panel-actions {
    @apply flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg;
  }

  .cancel-button {
    @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .publish-button {
    @apply flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .unpublish-button {
    @apply flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .loading-spinner {
    @apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin;
  }
</style>
