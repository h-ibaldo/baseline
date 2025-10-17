<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import RichTextEditor from './RichTextEditor.svelte';
  import RichTextToolbar from './RichTextToolbar.svelte';
  import LoadingState from '../ui/LoadingState.svelte';
  import ToastManager from '../ui/ToastManager.svelte';

  export let post: {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    status: 'draft' | 'published';
    publishedAt?: Date;
    authorId: string;
    categoryId?: string;
    tags: string[];
    featuredImage?: string;
    seoTitle?: string;
    seoDescription?: string;
  } = {
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    authorId: '',
    tags: []
  };

  export let categories: Array<{ id: string; name: string; slug: string }> = [];
  export let loading: boolean = false;
  export let saving: boolean = false;

  const dispatch = createEventDispatcher();

  let editorContent = post.content;
  let editorSelection: any = null;
  let canUndo = false;
  let canRedo = false;
  let showImageDialog = false;
  let showLinkDialog = false;
  let showTableDialog = false;

  // Image dialog state
  let imageUrl = '';
  let imageAlt = '';

  // Link dialog state
  let linkUrl = '';
  let linkText = '';

  // Table dialog state
  let tableRows = 3;
  let tableCols = 3;

  onMount(() => {
    editorContent = post.content;
  });

  function handleContentUpdate(event: CustomEvent) {
    editorContent = event.detail.content;
    dispatch('update', { ...post, content: editorContent });
  }

  function handleSelectionUpdate(event: CustomEvent) {
    editorSelection = event.detail.selection;
    canUndo = event.detail.isActive('history', { undo: true });
    canRedo = event.detail.isActive('history', { undo: false });
  }

  function handleToolbarAction(event: CustomEvent) {
    const { action, args } = event.detail;
    
    switch (action) {
      case 'insertImage':
        showImageDialog = true;
        break;
      case 'insertLink':
        showLinkDialog = true;
        break;
      case 'insertTable':
        showTableDialog = true;
        break;
      default:
        // Forward other actions to the editor
        dispatch('editorAction', { action, args });
        break;
    }
  }

  function handleImageInsert() {
    if (imageUrl) {
      dispatch('editorAction', { 
        action: 'insertImage', 
        args: [imageUrl, imageAlt || ''] 
      });
      showImageDialog = false;
      imageUrl = '';
      imageAlt = '';
    }
  }

  function handleLinkInsert() {
    if (linkUrl) {
      dispatch('editorAction', { 
        action: 'insertLink', 
        args: [linkUrl, linkText || linkUrl] 
      });
      showLinkDialog = false;
      linkUrl = '';
      linkText = '';
    }
  }

  function handleTableInsert() {
    dispatch('editorAction', { 
      action: 'insertTable', 
      args: [tableRows, tableCols] 
    });
    showTableDialog = false;
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  function handleTitleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newTitle = target.value;
    const newSlug = generateSlug(newTitle);
    
    dispatch('update', { 
      ...post, 
      title: newTitle, 
      slug: newSlug 
    });
  }

  function handleSlugChange(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('update', { ...post, slug: target.value });
  }

  function handleExcerptChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    dispatch('update', { ...post, excerpt: target.value });
  }

  function handleCategoryChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    dispatch('update', { ...post, categoryId: target.value || undefined });
  }

  function handleTagsChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const tags = target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    dispatch('update', { ...post, tags });
  }

  function handleStatusChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as 'draft' | 'published';
    dispatch('update', { 
      ...post, 
      status: newStatus,
      publishedAt: newStatus === 'published' ? new Date() : post.publishedAt
    });
  }

  function handleSave() {
    dispatch('save', { ...post, content: editorContent });
  }

  function handlePublish() {
    dispatch('publish', { ...post, content: editorContent });
  }

  function handlePreview() {
    dispatch('preview', { ...post, content: editorContent });
  }
</script>

<div class="blog-post-editor">
  <ToastManager />

  {#if loading}
    <LoadingState message="Loading blog post..." />
  {:else}
    <!-- Header -->
    <div class="editor-header">
      <div class="header-left">
        <h1 class="editor-title">Blog Post Editor</h1>
        <div class="post-status">
          <span class="status-badge" class:published={post.status === 'published'}>
            {post.status === 'published' ? 'Published' : 'Draft'}
          </span>
          {#if post.publishedAt}
            <span class="published-date">
              {new Date(post.publishedAt).toLocaleDateString()}
            </span>
          {/if}
        </div>
      </div>
      
      <div class="header-actions">
        <button
          type="button"
          class="action-button secondary"
          on:click={handlePreview}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>
        
        <button
          type="button"
          class="action-button primary"
          on:click={handleSave}
          disabled={saving}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        
        <button
          type="button"
          class="action-button success"
          on:click={handlePublish}
          disabled={saving}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Publish
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="editor-content">
      <!-- Sidebar -->
      <aside class="editor-sidebar">
        <div class="sidebar-section">
          <h3 class="section-title">Post Settings</h3>
          
          <div class="form-group">
            <label for="post-status" class="form-label">Status</label>
            <select id="post-status" bind:value={post.status} on:change={handleStatusChange} class="form-select">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div class="form-group">
            <label for="post-category" class="form-label">Category</label>
            <select id="post-category" bind:value={post.categoryId} on:change={handleCategoryChange} class="form-select">
              <option value="">No Category</option>
              {#each categories as category}
                <option value={category.id}>{category.name}</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="post-tags" class="form-label">Tags</label>
            <input
              id="post-tags"
              type="text"
              value={post.tags.join(', ')}
              on:input={handleTagsChange}
              placeholder="tag1, tag2, tag3"
              class="form-input"
            />
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">SEO Settings</h3>
          
          <div class="form-group">
            <label for="seo-title" class="form-label">SEO Title</label>
            <input
              id="seo-title"
              type="text"
              bind:value={post.seoTitle}
              placeholder={post.title || 'Enter title'}
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="seo-description" class="form-label">SEO Description</label>
            <textarea
              id="seo-description"
              bind:value={post.seoDescription}
              placeholder="Enter meta description"
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>
        </div>
      </aside>

      <!-- Main Editor -->
      <main class="editor-main">
        <!-- Post Meta -->
        <div class="post-meta">
          <div class="form-group">
            <label for="post-title" class="form-label">Title</label>
            <input
              id="post-title"
              type="text"
              bind:value={post.title}
              on:input={handleTitleChange}
              placeholder="Enter post title"
              class="form-input title-input"
            />
          </div>

          <div class="form-group">
            <label for="post-slug" class="form-label">Slug</label>
            <input
              id="post-slug"
              type="text"
              bind:value={post.slug}
              on:input={handleSlugChange}
              placeholder="post-slug"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="post-excerpt" class="form-label">Excerpt</label>
            <textarea
              id="post-excerpt"
              bind:value={post.excerpt}
              on:input={handleExcerptChange}
              placeholder="Brief description of the post"
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>
        </div>

        <!-- Rich Text Editor -->
        <div class="rich-text-section">
          <RichTextToolbar
            {isActive}
            {canUndo}
            {canRedo}
            on:action={handleToolbarAction}
          />
          <RichTextEditor
            bind:content={editorContent}
            placeholder="Start writing your blog post..."
            minHeight="400px"
            on:update={handleContentUpdate}
            on:selectionUpdate={handleSelectionUpdate}
          />
        </div>
      </main>
    </div>
  {/if}

  <!-- Image Dialog -->
  {#if showImageDialog}
    <div class="modal-backdrop" on:click={() => showImageDialog = false}>
      <div class="modal" on:click|stopPropagation>
        <div class="modal-header">
          <h3 class="modal-title">Insert Image</h3>
          <button type="button" class="modal-close" on:click={() => showImageDialog = false}>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label for="image-url" class="form-label">Image URL</label>
            <input
              id="image-url"
              type="url"
              bind:value={imageUrl}
              placeholder="https://example.com/image.jpg"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="image-alt" class="form-label">Alt Text</label>
            <input
              id="image-alt"
              type="text"
              bind:value={imageAlt}
              placeholder="Describe the image"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="action-button secondary" on:click={() => showImageDialog = false}>
            Cancel
          </button>
          <button type="button" class="action-button primary" on:click={handleImageInsert}>
            Insert Image
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Link Dialog -->
  {#if showLinkDialog}
    <div class="modal-backdrop" on:click={() => showLinkDialog = false}>
      <div class="modal" on:click|stopPropagation>
        <div class="modal-header">
          <h3 class="modal-title">Insert Link</h3>
          <button type="button" class="modal-close" on:click={() => showLinkDialog = false}>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label for="link-url" class="form-label">URL</label>
            <input
              id="link-url"
              type="url"
              bind:value={linkUrl}
              placeholder="https://example.com"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="link-text" class="form-label">Link Text</label>
            <input
              id="link-text"
              type="text"
              bind:value={linkText}
              placeholder="Link text"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="action-button secondary" on:click={() => showLinkDialog = false}>
            Cancel
          </button>
          <button type="button" class="action-button primary" on:click={handleLinkInsert}>
            Insert Link
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Table Dialog -->
  {#if showTableDialog}
    <div class="modal-backdrop" on:click={() => showTableDialog = false}>
      <div class="modal" on:click|stopPropagation>
        <div class="modal-header">
          <h3 class="modal-title">Insert Table</h3>
          <button type="button" class="modal-close" on:click={() => showTableDialog = false}>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label for="table-rows" class="form-label">Rows</label>
            <input
              id="table-rows"
              type="number"
              bind:value={tableRows}
              min="1"
              max="10"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="table-cols" class="form-label">Columns</label>
            <input
              id="table-cols"
              type="number"
              bind:value={tableCols}
              min="1"
              max="10"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="action-button secondary" on:click={() => showTableDialog = false}>
            Cancel
          </button>
          <button type="button" class="action-button primary" on:click={handleTableInsert}>
            Insert Table
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .blog-post-editor {
    @apply h-screen flex flex-col bg-gray-50;
  }

  .editor-header {
    @apply flex items-center justify-between p-4 bg-white border-b border-gray-200;
  }

  .header-left {
    @apply flex items-center gap-4;
  }

  .editor-title {
    @apply text-xl font-semibold text-gray-900;
  }

  .post-status {
    @apply flex items-center gap-2;
  }

  .status-badge {
    @apply px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800;
  }

  .status-badge.published {
    @apply bg-green-100 text-green-800;
  }

  .published-date {
    @apply text-sm text-gray-500;
  }

  .header-actions {
    @apply flex items-center gap-2;
  }

  .action-button {
    @apply flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors;
  }

  .action-button.primary {
    @apply text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50;
  }

  .action-button.secondary {
    @apply text-gray-700 bg-gray-100 hover:bg-gray-200;
  }

  .action-button.success {
    @apply text-white bg-green-600 hover:bg-green-700 disabled:opacity-50;
  }

  .editor-content {
    @apply flex-1 flex overflow-hidden;
  }

  .editor-sidebar {
    @apply w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto;
  }

  .sidebar-section {
    @apply mb-6;
  }

  .section-title {
    @apply text-sm font-semibold text-gray-900 mb-3;
  }

  .form-group {
    @apply mb-4;
  }

  .form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }

  .form-input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  }

  .title-input {
    @apply text-lg font-semibold;
  }

  .form-textarea {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical;
  }

  .form-select {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  }

  .editor-main {
    @apply flex-1 flex flex-col overflow-hidden;
  }

  .post-meta {
    @apply p-4 bg-white border-b border-gray-200;
  }

  .rich-text-section {
    @apply flex-1 flex flex-col overflow-hidden;
  }

  .modal-backdrop {
    @apply fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4;
  }

  .modal {
    @apply bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden;
  }

  .modal-header {
    @apply flex items-center justify-between p-4 border-b border-gray-200;
  }

  .modal-title {
    @apply text-lg font-semibold text-gray-900;
  }

  .modal-close {
    @apply p-1 text-gray-400 hover:text-gray-600 rounded;
  }

  .modal-content {
    @apply p-4 space-y-4;
  }

  .modal-footer {
    @apply flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50;
  }
</style>
