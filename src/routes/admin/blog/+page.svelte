<script lang="ts">
  import { onMount } from 'svelte';
  import BlogPostEditor from '$lib/components/design/BlogPostEditor.svelte';
  import LoadingState from '$lib/components/ui/LoadingState.svelte';
  import ToastManager from '$lib/components/ui/ToastManager.svelte';

  interface BlogPost {
    id: string;
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
    createdAt: Date;
    updatedAt: Date;
  }

  interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
  }

  let posts: BlogPost[] = [];
  let categories: Category[] = [];
  let loading = true;
  let saving = false;
  let currentPost: BlogPost | null = null;
  let showEditor = false;
  let searchQuery = '';
  let statusFilter: 'all' | 'draft' | 'published' = 'all';
  let categoryFilter = '';

  onMount(async () => {
    await loadPosts();
    await loadCategories();
    loading = false;
  });

  async function loadPosts() {
    try {
      const response = await fetch('/api/posts');
      const result = await response.json();
      if (result.success) {
        posts = result.data;
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      if (result.success) {
        categories = result.data;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  function createNewPost() {
    currentPost = {
      id: '',
      title: '',
      slug: '',
      content: '',
      status: 'draft',
      authorId: 'current-user', // TODO: Get from auth
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    showEditor = true;
  }

  function editPost(post: BlogPost) {
    currentPost = { ...post };
    showEditor = true;
  }

  function closeEditor() {
    showEditor = false;
    currentPost = null;
  }

  async function handleSave(event: CustomEvent) {
    try {
      saving = true;
      const postData = event.detail;
      
      const url = postData.id ? `/api/posts/${postData.id}` : '/api/posts';
      const method = postData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();
      if (result.success) {
        await loadPosts();
        closeEditor();
        if (window.showSuccess) {
          window.showSuccess('Post saved successfully');
        }
      } else {
        if (window.showError) {
          window.showError(result.error || 'Failed to save post');
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
      if (window.showError) {
        window.showError('Failed to save post');
      }
    } finally {
      saving = false;
    }
  }

  async function handlePublish(event: CustomEvent) {
    try {
      saving = true;
      const postData = { ...event.detail, status: 'published' };
      
      const url = postData.id ? `/api/posts/${postData.id}` : '/api/posts';
      const method = postData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();
      if (result.success) {
        await loadPosts();
        closeEditor();
        if (window.showSuccess) {
          window.showSuccess('Post published successfully');
        }
      } else {
        if (window.showError) {
          window.showError(result.error || 'Failed to publish post');
        }
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      if (window.showError) {
        window.showError('Failed to publish post');
      }
    } finally {
      saving = false;
    }
  }

  async function deletePost(postId: string) {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        await loadPosts();
        if (window.showSuccess) {
          window.showSuccess('Post deleted successfully');
        }
      } else {
        if (window.showError) {
          window.showError(result.error || 'Failed to delete post');
        }
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      if (window.showError) {
        window.showError('Failed to delete post');
      }
    }
  }

  function getFilteredPosts() {
    return posts.filter(post => {
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      
      const matchesCategory = !categoryFilter || post.categoryId === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  function getCategoryName(categoryId?: string) {
    if (!categoryId) return 'No Category';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString();
  }
</script>

<div class="blog-management">
  <ToastManager />

  {#if showEditor && currentPost}
    <BlogPostEditor
      post={currentPost}
      {categories}
      {saving}
      on:update={(e) => currentPost = e.detail}
      on:save={handleSave}
      on:publish={handlePublish}
      on:preview={() => console.log('Preview post')}
      on:close={closeEditor}
    />
  {:else}
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Blog Management</h1>
        <p class="page-description">Manage your blog posts and content</p>
      </div>
      
      <div class="header-actions">
        <button
          type="button"
          class="action-button primary"
          on:click={createNewPost}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </button>
      </div>
    </header>

    <!-- Filters -->
    <div class="filters-section">
      <div class="search-container">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search posts..."
          class="search-input"
        />
      </div>

      <div class="filter-group">
        <select bind:value={statusFilter} class="filter-select">
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <select bind:value={categoryFilter} class="filter-select">
          <option value="">All Categories</option>
          {#each categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Posts List -->
    <main class="posts-section">
      {#if loading}
        <LoadingState message="Loading blog posts..." />
      {:else if getFilteredPosts().length === 0}
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3 class="empty-title">No posts found</h3>
          <p class="empty-description">
            {#if searchQuery || statusFilter !== 'all' || categoryFilter}
              Try adjusting your filters
            {:else}
              Create your first blog post to get started
            {/if}
          </p>
          {#if !searchQuery && statusFilter === 'all' && !categoryFilter}
            <button
              type="button"
              class="action-button primary"
              on:click={createNewPost}
            >
              Create First Post
            </button>
          {/if}
        </div>
      {:else}
        <div class="posts-grid">
          {#each getFilteredPosts() as post (post.id)}
            <div class="post-card">
              <div class="post-header">
                <h3 class="post-title">{post.title || 'Untitled'}</h3>
                <div class="post-actions">
                  <button
                    type="button"
                    class="action-button small"
                    on:click={() => editPost(post)}
                    title="Edit Post"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="action-button small danger"
                    on:click={() => deletePost(post.id)}
                    title="Delete Post"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="post-content">
                {#if post.excerpt}
                  <p class="post-excerpt">{post.excerpt}</p>
                {:else}
                  <p class="post-excerpt text-gray-400">No excerpt available</p>
                {/if}
              </div>

              <div class="post-meta">
                <div class="meta-item">
                  <span class="meta-label">Status:</span>
                  <span class="status-badge" class:published={post.status === 'published'}>
                    {post.status}
                  </span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Category:</span>
                  <span class="meta-value">{getCategoryName(post.categoryId)}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Updated:</span>
                  <span class="meta-value">{formatDate(post.updatedAt)}</span>
                </div>
                {#if post.publishedAt}
                  <div class="meta-item">
                    <span class="meta-label">Published:</span>
                    <span class="meta-value">{formatDate(post.publishedAt)}</span>
                  </div>
                {/if}
              </div>

              {#if post.tags.length > 0}
                <div class="post-tags">
                  {#each post.tags as tag}
                    <span class="tag">{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </main>
  {/if}
</div>

<style>
  .blog-management {
    @apply h-screen flex flex-col bg-gray-50;
  }

  .page-header {
    @apply flex items-center justify-between p-6 bg-white border-b border-gray-200;
  }

  .header-left {
    @apply flex-1;
  }

  .page-title {
    @apply text-2xl font-bold text-gray-900;
  }

  .page-description {
    @apply text-gray-600 mt-1;
  }

  .header-actions {
    @apply flex items-center gap-3;
  }

  .action-button {
    @apply flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors;
  }

  .action-button.primary {
    @apply text-white bg-blue-600 hover:bg-blue-700;
  }

  .action-button.small {
    @apply px-2 py-1 text-xs;
  }

  .action-button.danger {
    @apply text-red-600 hover:text-red-700 hover:bg-red-50;
  }

  .filters-section {
    @apply flex items-center gap-4 p-4 bg-white border-b border-gray-200;
  }

  .search-container {
    @apply relative flex-1 max-w-md;
  }

  .search-icon {
    @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400;
  }

  .search-input {
    @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  }

  .filter-group {
    @apply flex items-center gap-2;
  }

  .filter-select {
    @apply px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  }

  .posts-section {
    @apply flex-1 p-6 overflow-y-auto;
  }

  .empty-state {
    @apply flex flex-col items-center justify-center py-12 text-center;
  }

  .empty-icon {
    @apply text-6xl mb-4;
  }

  .empty-title {
    @apply text-xl font-semibold text-gray-900 mb-2;
  }

  .empty-description {
    @apply text-gray-500 mb-4;
  }

  .posts-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
  }

  .post-card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow;
  }

  .post-header {
    @apply flex items-start justify-between mb-3;
  }

  .post-title {
    @apply text-lg font-semibold text-gray-900 flex-1 mr-2;
  }

  .post-actions {
    @apply flex items-center gap-1;
  }

  .post-content {
    @apply mb-4;
  }

  .post-excerpt {
    @apply text-gray-600 text-sm line-clamp-3;
  }

  .post-meta {
    @apply space-y-1 mb-3;
  }

  .meta-item {
    @apply flex items-center gap-2 text-xs text-gray-500;
  }

  .meta-label {
    @apply font-medium;
  }

  .meta-value {
    @apply text-gray-700;
  }

  .status-badge {
    @apply px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800;
  }

  .status-badge.published {
    @apply bg-green-100 text-green-800;
  }

  .post-tags {
    @apply flex flex-wrap gap-1;
  }

  .tag {
    @apply px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded;
  }
</style>
