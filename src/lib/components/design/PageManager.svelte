<script lang="ts">
  export let pages: Array<{
    id: string;
    name: string;
    slug: string;
    status: 'draft' | 'published';
    isBlogTemplate: boolean;
    blogTemplateType?: string;
  }>;
  export let currentPageId: string | null;
  export let onPageSelect: (pageId: string) => void;
  export let onPageCreate: () => void;
  export let onPageDelete: (pageId: string) => void;
  export let onPageDuplicate: (pageId: string) => void;
  export let onPageNameUpdate: (pageId: string, name: string) => void;
  export let onPageSlugUpdate: (pageId: string, slug: string) => void;
  export let onToggleBlogTemplate: (pageId: string) => void;

  let editingPageId: string | null = null;
  let editingName = '';
  let editingSlug = '';

  function startEditing(pageId: string, currentName: string, currentSlug: string) {
    editingPageId = pageId;
    editingName = currentName;
    editingSlug = currentSlug;
  }

  function saveEdit() {
    if (editingPageId) {
      onPageNameUpdate(editingPageId, editingName);
      onPageSlugUpdate(editingPageId, editingSlug);
      editingPageId = null;
    }
  }

  function cancelEdit() {
    editingPageId = null;
    editingName = '';
    editingSlug = '';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      saveEdit();
    } else if (event.key === 'Escape') {
      cancelEdit();
    }
  }

  function getStatusColor(status: string): string {
    return status === 'published' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  }

  function getStatusIcon(status: string): string {
    return status === 'published' ? '🌐' : '📝';
  }
</script>

<div class="page-manager">
  <!-- Header -->
  <div class="manager-header">
    <h3 class="manager-title">Pages</h3>
    <button
      type="button"
      on:click={onPageCreate}
      class="create-button"
      title="Create New Page"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      New Page
    </button>
  </div>

  <!-- Pages List -->
  <div class="pages-list">
    {#each pages as page (page.id)}
      <div
        class="page-item"
        class:active={page.id === currentPageId}
        on:click={() => onPageSelect(page.id)}
        on:keydown={(e) => e.key === 'Enter' && onPageSelect(page.id)}
        role="button"
        tabindex="0"
      >
        <!-- Page Info -->
        <div class="page-info">
          {#if editingPageId === page.id}
            <!-- Edit Mode -->
            <div class="edit-form">
              <input
                type="text"
                bind:value={editingName}
                on:keydown={handleKeydown}
                on:blur={saveEdit}
                class="edit-input"
                placeholder="Page name"
              />
              <input
                type="text"
                bind:value={editingSlug}
                on:keydown={handleKeydown}
                on:blur={saveEdit}
                class="edit-input"
                placeholder="Page slug"
              />
            </div>
          {:else}
            <!-- Display Mode -->
            <div class="page-header">
              <h4 class="page-name">{page.name}</h4>
              <div class="page-badges">
                <span class="status-badge {getStatusColor(page.status)}">
                  {getStatusIcon(page.status)} {page.status}
                </span>
                {#if page.isBlogTemplate}
                  <span class="blog-badge">
                    📝 Blog
                  </span>
                {/if}
              </div>
            </div>
            <div class="page-meta">
              <span class="page-slug">/{page.slug || 'no-slug'}</span>
              {#if page.isBlogTemplate && page.blogTemplateType}
                <span class="template-type">{page.blogTemplateType}</span>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Page Actions -->
        <div class="page-actions">
          {#if editingPageId === page.id}
            <button
              type="button"
              on:click={saveEdit}
              class="action-button save"
              title="Save"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              type="button"
              on:click={cancelEdit}
              class="action-button cancel"
              title="Cancel"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {:else}
            <button
              type="button"
              on:click={() => startEditing(page.id, page.name, page.slug)}
              class="action-button edit"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              on:click={() => onPageDuplicate(page.id)}
              class="action-button duplicate"
              title="Duplicate"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              on:click={() => onToggleBlogTemplate(page.id)}
              class="action-button blog"
              class:active={page.isBlogTemplate}
              title={page.isBlogTemplate ? 'Remove Blog Template' : 'Mark as Blog Template'}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              type="button"
              on:click={() => onPageDelete(page.id)}
              class="action-button delete"
              title="Delete"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <!-- Empty State -->
  {#if pages.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📄</div>
      <h4>No pages yet</h4>
      <p>Create your first page to start designing</p>
      <button
        type="button"
        on:click={onPageCreate}
        class="create-first-button"
      >
        Create Page
      </button>
    </div>
  {/if}
</div>

<style>
  .page-manager {
    @apply h-full flex flex-col bg-white;
  }

  .manager-header {
    @apply flex items-center justify-between p-4 border-b border-gray-200;
  }

  .manager-title {
    @apply text-lg font-semibold text-gray-900;
  }

  .create-button {
    @apply flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .pages-list {
    @apply flex-1 overflow-y-auto p-2 space-y-2;
  }

  .page-item {
    @apply p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .page-item.active {
    @apply bg-blue-50 border-blue-300 ring-2 ring-blue-200;
  }

  .page-info {
    @apply flex-1;
  }

  .page-header {
    @apply flex items-start justify-between mb-2;
  }

  .page-name {
    @apply text-sm font-semibold text-gray-900 truncate flex-1;
  }

  .page-badges {
    @apply flex gap-1 ml-2;
  }

  .status-badge {
    @apply px-2 py-1 text-xs font-medium rounded-full;
  }

  .blog-badge {
    @apply px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full;
  }

  .page-meta {
    @apply flex items-center gap-2 text-xs text-gray-500;
  }

  .page-slug {
    @apply font-mono;
  }

  .template-type {
    @apply px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded;
  }

  .edit-form {
    @apply space-y-2;
  }

  .edit-input {
    @apply w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .page-actions {
    @apply flex items-center gap-1 mt-2;
  }

  .action-button {
    @apply p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors;
  }

  .action-button.active {
    @apply text-blue-600 bg-blue-100;
  }

  .action-button.save {
    @apply text-green-600 hover:text-green-700 hover:bg-green-100;
  }

  .action-button.cancel {
    @apply text-red-600 hover:text-red-700 hover:bg-red-100;
  }

  .action-button.delete {
    @apply text-red-600 hover:text-red-700 hover:bg-red-100;
  }

  .empty-state {
    @apply flex flex-col items-center justify-center py-12 text-center;
  }

  .empty-icon {
    @apply text-4xl mb-4;
  }

  .empty-state h4 {
    @apply text-lg font-semibold text-gray-900 mb-2;
  }

  .empty-state p {
    @apply text-gray-500 mb-4;
  }

  .create-first-button {
    @apply px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
</style>
