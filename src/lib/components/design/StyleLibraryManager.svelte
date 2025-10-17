<script lang="ts">
  import { onMount } from 'svelte';
  import type { StyleLibraryWithStats } from '$lib/server/services/style-libraries.js';

  export let libraries: StyleLibraryWithStats[] = [];
  export let loading: boolean = false;
  export let onLibrarySelect: ((library: StyleLibraryWithStats) => void) | undefined = undefined;
  export let onCreateLibrary: (() => void) | undefined = undefined;
  export let onEditLibrary: ((library: StyleLibraryWithStats) => void) | undefined = undefined;
  export let onDeleteLibrary: ((library: StyleLibraryWithStats) => void) | undefined = undefined;
  export let onDuplicateLibrary: ((library: StyleLibraryWithStats) => void) | undefined = undefined;
  export let onExportLibrary: ((library: StyleLibraryWithStats) => void) | undefined = undefined;
  export let searchQuery: string = '';
  export let showPublic: boolean = true;
  export let showPrivate: boolean = true;

  let filteredLibraries: StyleLibraryWithStats[] = [];
  let selectedLibrary: StyleLibraryWithStats | null = null;

  // Filter libraries based on search and visibility
  $: {
    filteredLibraries = libraries.filter(library => {
      // Search filter
      const matchesSearch = !searchQuery || 
        library.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (library.description && library.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Visibility filter
      const matchesVisibility = (showPublic && library.isPublic) || (showPrivate && !library.isPublic);

      return matchesSearch && matchesVisibility;
    });
  }

  function handleLibraryClick(library: StyleLibraryWithStats) {
    selectedLibrary = library;
    if (onLibrarySelect) {
      onLibrarySelect(library);
    }
  }

  function handleCreateLibrary() {
    if (onCreateLibrary) {
      onCreateLibrary();
    }
  }

  function handleEditLibrary(library: StyleLibraryWithStats, event: Event) {
    event.stopPropagation();
    if (onEditLibrary) {
      onEditLibrary(library);
    }
  }

  function handleDeleteLibrary(library: StyleLibraryWithStats, event: Event) {
    event.stopPropagation();
    if (onDeleteLibrary) {
      onDeleteLibrary(library);
    }
  }

  function handleDuplicateLibrary(library: StyleLibraryWithStats, event: Event) {
    event.stopPropagation();
    if (onDuplicateLibrary) {
      onDuplicateLibrary(library);
    }
  }

  function handleExportLibrary(library: StyleLibraryWithStats, event: Event) {
    event.stopPropagation();
    if (onExportLibrary) {
      onExportLibrary(library);
    }
  }

  function getLibraryIcon(library: StyleLibraryWithStats): string {
    if (library.name.toLowerCase().includes('default')) return '🎨';
    if (library.name.toLowerCase().includes('dark')) return '🌙';
    if (library.name.toLowerCase().includes('minimal')) return '⚪';
    if (library.name.toLowerCase().includes('colorful')) return '🌈';
    return '📚';
  }

  function formatUsageCount(count: number): string {
    if (count === 0) return 'No usage';
    if (count === 1) return '1 component';
    return `${count} components`;
  }

  function parseLibraryData(library: StyleLibraryWithStats) {
    return {
      colors: library.colors ? JSON.parse(library.colors) : null,
      typography: library.typography ? JSON.parse(library.typography) : null,
      spacing: library.spacing ? JSON.parse(library.spacing) : null,
      components: library.components ? JSON.parse(library.components) : null,
    };
  }
</script>

<div class="style-library-manager">
  <!-- Header -->
  <div class="manager-header">
    <h3 class="manager-title">Style Libraries</h3>
    <button
      type="button"
      on:click={handleCreateLibrary}
      class="create-button"
      title="Create New Style Library"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      New Library
    </button>
  </div>

  <!-- Search and Filters -->
  <div class="manager-filters">
    <!-- Search -->
    <div class="search-container">
      <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search libraries..."
        class="search-input"
      />
    </div>

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

  <!-- Libraries List -->
  <div class="libraries-list">
    {#if loading}
      <!-- Loading State -->
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading style libraries...</p>
      </div>
    {:else if filteredLibraries.length === 0}
      <!-- Empty State -->
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h4>No style libraries found</h4>
        <p>
          {#if searchQuery}
            Try adjusting your search
          {:else}
            Create your first style library to get started
          {/if}
        </p>
        {#if !searchQuery}
          <button
            type="button"
            on:click={handleCreateLibrary}
            class="create-first-button"
          >
            Create Library
          </button>
        {/if}
      </div>
    {:else}
      <!-- Library Cards -->
      {#each filteredLibraries as library (library.id)}
        <div
          class="library-card"
          class:active={selectedLibrary?.id === library.id}
          class:public={library.isPublic}
          class:private={!library.isPublic}
          on:click={() => handleLibraryClick(library)}
          on:keydown={(e) => e.key === 'Enter' && handleLibraryClick(library)}
          role="button"
          tabindex="0"
        >
          <!-- Library Preview -->
          <div class="library-preview">
            <div class="preview-icon">
              {getLibraryIcon(library)}
            </div>
            <div class="preview-colors">
              {#if library.colors}
                {@const colors = JSON.parse(library.colors)}
                <div class="color-palette">
                  {#each Object.entries(colors).slice(0, 6) as [name, color]}
                    <div 
                      class="color-swatch"
                      style="background-color: {color}"
                      title="{name}: {color}"
                    ></div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

          <!-- Library Info -->
          <div class="library-info">
            <div class="library-header">
              <h4 class="library-name">{library.name}</h4>
              <div class="library-badges">
                {#if library.isPublic}
                  <span class="badge public">Public</span>
                {:else}
                  <span class="badge private">Private</span>
                {/if}
                <span class="badge version">v{library.version}</span>
              </div>
            </div>

            {#if library.description}
              <p class="library-description">{library.description}</p>
            {/if}

            <div class="library-stats">
              <div class="stat">
                <span class="stat-label">Components</span>
                <span class="stat-value">{library.componentCount}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Usage</span>
                <span class="stat-value">{formatUsageCount(library.usageCount)}</span>
              </div>
            </div>
          </div>

          <!-- Library Actions -->
          <div class="library-actions">
            <button
              type="button"
              on:click={(e) => handleEditLibrary(library, e)}
              class="action-button edit"
              title="Edit Library"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              on:click={(e) => handleDuplicateLibrary(library, e)}
              class="action-button duplicate"
              title="Duplicate Library"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              on:click={(e) => handleExportLibrary(library, e)}
              class="action-button export"
              title="Export Library"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              type="button"
              on:click={(e) => handleDeleteLibrary(library, e)}
              class="action-button delete"
              title="Delete Library"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Stats -->
  {#if libraries.length > 0}
    <div class="manager-stats">
      <span>{filteredLibraries.length} of {libraries.length} libraries</span>
      {#if searchQuery}
        <span>• Searching for "{searchQuery}"</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .style-library-manager {
    @apply w-full h-full flex flex-col bg-white;
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

  .manager-filters {
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

  .visibility-toggle {
    @apply flex gap-4;
  }

  .toggle-item {
    @apply flex items-center gap-2 text-sm text-gray-700 cursor-pointer;
  }

  .toggle-item input[type="checkbox"] {
    @apply rounded border-gray-300 text-blue-600 focus:ring-blue-500;
  }

  .libraries-list {
    @apply flex-1 p-4 overflow-y-auto space-y-3;
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

  .library-card {
    @apply relative p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .library-card.active {
    @apply bg-blue-50 border-blue-300 ring-2 ring-blue-200;
  }

  .library-card.public {
    @apply border-green-200 bg-green-50;
  }

  .library-card.private {
    @apply border-gray-200 bg-white;
  }

  .library-preview {
    @apply flex items-center gap-3 mb-3;
  }

  .preview-icon {
    @apply text-2xl;
  }

  .preview-colors {
    @apply flex-1;
  }

  .color-palette {
    @apply flex gap-1;
  }

  .color-swatch {
    @apply w-4 h-4 rounded border border-gray-200;
  }

  .library-info {
    @apply flex-1;
  }

  .library-header {
    @apply flex items-start justify-between mb-2;
  }

  .library-name {
    @apply text-sm font-semibold text-gray-900 truncate flex-1;
  }

  .library-badges {
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

  .badge.version {
    @apply bg-blue-100 text-blue-800;
  }

  .library-description {
    @apply text-xs text-gray-600 mb-3 line-clamp-2;
  }

  .library-stats {
    @apply flex gap-4 text-xs text-gray-500;
  }

  .stat {
    @apply flex flex-col;
  }

  .stat-label {
    @apply font-medium;
  }

  .stat-value {
    @apply text-gray-900;
  }

  .library-actions {
    @apply absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity;
  }

  .action-button {
    @apply p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors;
  }

  .action-button.edit {
    @apply hover:text-blue-600 hover:bg-blue-100;
  }

  .action-button.duplicate {
    @apply hover:text-green-600 hover:bg-green-100;
  }

  .action-button.export {
    @apply hover:text-purple-600 hover:bg-purple-100;
  }

  .action-button.delete {
    @apply hover:text-red-600 hover:bg-red-100;
  }

  .manager-stats {
    @apply px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50;
  }
</style>
