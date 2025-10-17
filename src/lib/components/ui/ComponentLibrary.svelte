<script lang="ts">
  import { onMount } from 'svelte';
  import type { ComponentWithLibrary } from '$lib/server/services/components.js';

  export let components: ComponentWithLibrary[] = [];
  export let loading: boolean = false;
  export let onComponentSelect: ((component: ComponentWithLibrary) => void) | undefined = undefined;
  export let onCreateComponent: (() => void) | undefined = undefined;
  export let searchQuery: string = '';
  export let selectedCategory: string = 'all';
  export let showPublic: boolean = true;
  export let showPrivate: boolean = true;

  let categories: string[] = [];
  let filteredComponents: ComponentWithLibrary[] = [];

  // Filter components based on search and category
  $: {
    filteredComponents = components.filter(component => {
      // Search filter
      const matchesSearch = !searchQuery || 
        component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (component.description && component.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;

      // Visibility filter
      const matchesVisibility = (showPublic && component.isPublic) || (showPrivate && !component.isPublic);

      return matchesSearch && matchesCategory && matchesVisibility;
    });
  }

  // Extract categories from components
  $: {
    const uniqueCategories = new Set(components.map(c => c.category));
    categories = ['all', ...Array.from(uniqueCategories)].sort();
  }

  function handleComponentClick(component: ComponentWithLibrary) {
    if (onComponentSelect) {
      onComponentSelect(component);
    }
  }

  function handleCreateComponent() {
    if (onCreateComponent) {
      onCreateComponent();
    }
  }

  function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'text': '📝',
      'image': '🖼️',
      'button': '🔘',
      'card': '🃏',
      'hero': '🎯',
      'navigation': '🧭',
      'form': '📋',
      'layout': '📐',
      'custom': '🧩',
    };
    return icons[category] || '🧩';
  }

  function formatUsageCount(count: number): string {
    if (count === 0) return 'New';
    if (count === 1) return '1 use';
    return `${count} uses`;
  }
</script>

<div class="component-library">
  <!-- Header -->
  <div class="library-header">
    <h3 class="library-title">Component Library</h3>
    <button
      type="button"
      on:click={handleCreateComponent}
      class="create-button"
      title="Create New Component"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Create Component
    </button>
  </div>

  <!-- Search and Filters -->
  <div class="library-filters">
    <!-- Search -->
    <div class="search-container">
      <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search components..."
        class="search-input"
      />
    </div>

    <!-- Category Filter -->
    <select bind:value={selectedCategory} class="category-select">
      {#each categories as category}
        <option value={category}>
          {category === 'all' ? 'All Categories' : `${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`}
        </option>
      {/each}
    </select>

    <!-- Visibility Toggle -->
    <div class="visibility-toggle">
      <label class="toggle-item">
        <input type="checkbox" bind:checked={showPublic} />
        <span>Public</span>
      </label>
      <label class="toggle-item">
        <input type="checkbox" bind:checked={showPrivate} />
        <span>Private</span>
      </label>
    </div>
  </div>

  <!-- Components Grid -->
  <div class="components-grid">
    {#if loading}
      <!-- Loading State -->
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading components...</p>
      </div>
    {:else if filteredComponents.length === 0}
      <!-- Empty State -->
      <div class="empty-state">
        <div class="empty-icon">🧩</div>
        <h4>No components found</h4>
        <p>
          {#if searchQuery || selectedCategory !== 'all'}
            Try adjusting your search or filters
          {:else}
            Create your first component to get started
          {/if}
        </p>
        {#if !searchQuery && selectedCategory === 'all'}
          <button
            type="button"
            on:click={handleCreateComponent}
            class="create-first-button"
          >
            Create Component
          </button>
        {/if}
      </div>
    {:else}
      <!-- Component Cards -->
      {#each filteredComponents as component (component.id)}
        <div
          class="component-card"
          class:public={component.isPublic}
          class:private={!component.isPublic}
          on:click={() => handleComponentClick(component)}
          on:keydown={(e) => e.key === 'Enter' && handleComponentClick(component)}
          role="button"
          tabindex="0"
        >
          <!-- Thumbnail -->
          <div class="component-thumbnail">
            {#if component.thumbnail}
              <img src={component.thumbnail} alt={component.name} />
            {:else}
              <div class="thumbnail-placeholder">
                {getCategoryIcon(component.category)}
              </div>
            {/if}
          </div>

          <!-- Content -->
          <div class="component-content">
            <div class="component-header">
              <h4 class="component-name">{component.name}</h4>
              <div class="component-badges">
                {#if component.isPublic}
                  <span class="badge public">Public</span>
                {:else}
                  <span class="badge private">Private</span>
                {/if}
                <span class="badge category">{component.category}</span>
              </div>
            </div>

            {#if component.description}
              <p class="component-description">{component.description}</p>
            {/if}

            <div class="component-footer">
              <div class="usage-count">
                {formatUsageCount(component.usageCount)}
              </div>
              <div class="component-meta">
                <span class="created-date">
                  {new Date(component.createdAt).toLocaleDateString()}
                </span>
                {#if component.styleLibrary}
                  <span class="style-library">
                    📚 {component.styleLibrary.name}
                  </span>
                {/if}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="component-actions">
            <button
              type="button"
              class="action-button"
              title="Use Component"
              on:click|stopPropagation={() => handleComponentClick(component)}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Stats -->
  {#if components.length > 0}
    <div class="library-stats">
      <span>{filteredComponents.length} of {components.length} components</span>
      {#if searchQuery}
        <span>• Searching for "{searchQuery}"</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .component-library {
    @apply w-full h-full flex flex-col bg-white border border-gray-200 rounded-lg;
  }

  .library-header {
    @apply flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg;
  }

  .library-title {
    @apply text-lg font-semibold text-gray-900;
  }

  .create-button {
    @apply flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .library-filters {
    @apply p-4 space-y-3 border-b border-gray-200;
  }

  .search-container {
    @apply relative;
  }

  .search-icon {
    @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400;
  }

  .search-input {
    @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  }

  .category-select {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  }

  .visibility-toggle {
    @apply flex gap-4;
  }

  .toggle-item {
    @apply flex items-center gap-2 text-sm text-gray-700 cursor-pointer;
  }

  .toggle-item input[type="checkbox"] {
    @apply rounded border-gray-300 text-blue-600 focus:ring-blue-500;
  }

  .components-grid {
    @apply flex-1 p-4 overflow-y-auto;
  }

  .loading-state {
    @apply flex flex-col items-center justify-center py-12 text-gray-500;
  }

  .loading-spinner {
    @apply w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4;
  }

  .empty-state {
    @apply flex flex-col items-center justify-center py-12 text-center;
  }

  .empty-icon {
    @apply text-6xl mb-4;
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

  .component-card {
    @apply relative bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .component-card.public {
    @apply border-green-200 bg-green-50;
  }

  .component-card.private {
    @apply border-gray-200 bg-white;
  }

  .component-thumbnail {
    @apply w-full h-24 mb-3 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center;
  }

  .component-thumbnail img {
    @apply w-full h-full object-cover;
  }

  .thumbnail-placeholder {
    @apply text-3xl text-gray-400;
  }

  .component-content {
    @apply flex-1;
  }

  .component-header {
    @apply flex items-start justify-between mb-2;
  }

  .component-name {
    @apply text-sm font-semibold text-gray-900 truncate flex-1;
  }

  .component-badges {
    @apply flex gap-1 ml-2;
  }

  .badge {
    @apply px-2 py-1 text-xs font-medium rounded-full;
  }

  .badge.public {
    @apply bg-green-100 text-green-800;
  }

  .badge.private {
    @apply bg-gray-100 text-gray-800;
  }

  .badge.category {
    @apply bg-blue-100 text-blue-800;
  }

  .component-description {
    @apply text-xs text-gray-600 mb-3 line-clamp-2;
  }

  .component-footer {
    @apply flex items-center justify-between text-xs text-gray-500;
  }

  .usage-count {
    @apply font-medium;
  }

  .component-meta {
    @apply flex flex-col items-end gap-1;
  }

  .style-library {
    @apply text-blue-600;
  }

  .component-actions {
    @apply absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity;
  }

  .action-button {
    @apply p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded;
  }

  .library-stats {
    @apply px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50 rounded-b-lg;
  }
</style>
