<script lang="ts">
  import { onMount } from 'svelte';
  import type { Theme } from '@prisma/client';

  export let themes: Theme[] = [];
  export let loading: boolean = false;
  export let onThemeSelect: ((theme: Theme) => void) | undefined = undefined;
  export let onCreateTheme: (() => void) | undefined = undefined;
  export let onEditTheme: ((theme: Theme) => void) | undefined = undefined;
  export let onDeleteTheme: ((theme: Theme) => void) | undefined = undefined;
  export let onDuplicateTheme: ((theme: Theme) => void) | undefined = undefined;
  export let onExportTheme: ((theme: Theme) => void) | undefined = undefined;
  export let onImportTheme: (() => void) | undefined = undefined;
  export let searchQuery: string = '';
  export let showPublic: boolean = true;
  export let showPrivate: boolean = true;

  let filteredThemes: Theme[] = [];
  let selectedTheme: Theme | null = null;

  // Filter themes based on search and visibility
  $: {
    filteredThemes = themes.filter(theme => {
      // Search filter
      const matchesSearch = !searchQuery || 
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (theme.description && theme.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Visibility filter
      const matchesVisibility = (showPublic && theme.isPublic) || (showPrivate && !theme.isPublic);

      return matchesSearch && matchesVisibility;
    });
  }

  function handleThemeClick(theme: Theme) {
    selectedTheme = theme;
    if (onThemeSelect) {
      onThemeSelect(theme);
    }
  }

  function handleCreateTheme() {
    if (onCreateTheme) {
      onCreateTheme();
    }
  }

  function handleEditTheme(theme: Theme, event: Event) {
    event.stopPropagation();
    if (onEditTheme) {
      onEditTheme(theme);
    }
  }

  function handleDeleteTheme(theme: Theme, event: Event) {
    event.stopPropagation();
    if (onDeleteTheme) {
      onDeleteTheme(theme);
    }
  }

  function handleDuplicateTheme(theme: Theme, event: Event) {
    event.stopPropagation();
    if (onDuplicateTheme) {
      onDuplicateTheme(theme);
    }
  }

  function handleExportTheme(theme: Theme, event: Event) {
    event.stopPropagation();
    if (onExportTheme) {
      onExportTheme(theme);
    }
  }

  function handleImportTheme() {
    if (onImportTheme) {
      onImportTheme();
    }
  }

  function getThemeIcon(theme: Theme): string {
    if (theme.name.toLowerCase().includes('minimal')) return '⚪';
    if (theme.name.toLowerCase().includes('dark')) return '🌙';
    if (theme.name.toLowerCase().includes('colorful')) return '🌈';
    if (theme.name.toLowerCase().includes('corporate')) return '🏢';
    if (theme.name.toLowerCase().includes('creative')) return '🎨';
    return '🎭';
  }

  function formatDownloadCount(count: number): string {
    if (count === 0) return 'No downloads';
    if (count === 1) return '1 download';
    return `${count} downloads`;
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function parseThemeData(theme: Theme) {
    try {
      return {
        theme: theme.themeData ? JSON.parse(theme.themeData) : null,
        components: theme.components ? JSON.parse(theme.components) : [],
        styles: theme.styles ? JSON.parse(theme.styles) : [],
        assets: theme.assets ? JSON.parse(theme.assets) : [],
      };
    } catch (error) {
      console.error('Error parsing theme data:', error);
      return {
        theme: null,
        components: [],
        styles: [],
        assets: [],
      };
    }
  }
</script>

<div class="theme-export-manager">
  <!-- Header -->
  <div class="manager-header">
    <h3 class="manager-title">Theme Export</h3>
    <div class="header-actions">
      <button
        type="button"
        on:click={handleImportTheme}
        class="import-button"
        title="Import Theme"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        Import
      </button>
      <button
        type="button"
        on:click={handleCreateTheme}
        class="create-button"
        title="Create New Theme"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Theme
      </button>
    </div>
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
        placeholder="Search themes..."
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

  <!-- Themes List -->
  <div class="themes-list">
    {#if loading}
      <!-- Loading State -->
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading themes...</p>
      </div>
    {:else if filteredThemes.length === 0}
      <!-- Empty State -->
      <div class="empty-state">
        <div class="empty-icon">🎭</div>
        <h4>No themes found</h4>
        <p>
          {#if searchQuery}
            Try adjusting your search
          {:else}
            Create your first theme to get started
          {/if}
        </p>
        {#if !searchQuery}
          <button
            type="button"
            on:click={handleCreateTheme}
            class="create-first-button"
          >
            Create Theme
          </button>
        {/if}
      </div>
    {:else}
      <!-- Theme Cards -->
      {#each filteredThemes as theme (theme.id)}
        <div
          class="theme-card"
          class:active={selectedTheme?.id === theme.id}
          class:public={theme.isPublic}
          class:private={!theme.isPublic}
          on:click={() => handleThemeClick(theme)}
          on:keydown={(e) => e.key === 'Enter' && handleThemeClick(theme)}
          role="button"
          tabindex="0"
        >
          <!-- Theme Preview -->
          <div class="theme-preview">
            <div class="preview-icon">
              {getThemeIcon(theme)}
            </div>
            <div class="preview-info">
              <div class="preview-title">{theme.name}</div>
              <div class="preview-version">v{theme.version}</div>
            </div>
          </div>

          <!-- Theme Info -->
          <div class="theme-info">
            <div class="theme-header">
              <h4 class="theme-name">{theme.name}</h4>
              <div class="theme-badges">
                {#if theme.isPublic}
                  <span class="badge public">Public</span>
                {:else}
                  <span class="badge private">Private</span>
                {/if}
                <span class="badge version">v{theme.version}</span>
              </div>
            </div>

            {#if theme.description}
              <p class="theme-description">{theme.description}</p>
            {/if}

            <div class="theme-stats">
              <div class="stat">
                <span class="stat-label">Downloads</span>
                <span class="stat-value">{formatDownloadCount(theme.downloadCount)}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Size</span>
                <span class="stat-value">
                  {#if theme.assets}
                    {@const assets = JSON.parse(theme.assets)}
                    {formatFileSize(assets.length * 1024)} {/* Rough estimate */}
                  {:else}
                    Small
                  {/if}
                </span>
              </div>
            </div>

            <div class="theme-meta">
              <span class="created-date">
                {new Date(theme.createdAt).toLocaleDateString()}
              </span>
              {#if theme.updatedAt !== theme.createdAt}
                <span class="updated-date">
                  Updated {new Date(theme.updatedAt).toLocaleDateString()}
                </span>
              {/if}
            </div>
          </div>

          <!-- Theme Actions -->
          <div class="theme-actions">
            <button
              type="button"
              on:click={(e) => handleEditTheme(theme, e)}
              class="action-button edit"
              title="Edit Theme"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              on:click={(e) => handleDuplicateTheme(theme, e)}
              class="action-button duplicate"
              title="Duplicate Theme"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              on:click={(e) => handleExportTheme(theme, e)}
              class="action-button export"
              title="Export Theme"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              type="button"
              on:click={(e) => handleDeleteTheme(theme, e)}
              class="action-button delete"
              title="Delete Theme"
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
  {#if themes.length > 0}
    <div class="manager-stats">
      <span>{filteredThemes.length} of {themes.length} themes</span>
      {#if searchQuery}
        <span>• Searching for "{searchQuery}"</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .theme-export-manager {
    @apply w-full h-full flex flex-col bg-white;
  }

  .manager-header {
    @apply flex items-center justify-between p-4 border-b border-gray-200;
  }

  .manager-title {
    @apply text-lg font-semibold text-gray-900;
  }

  .header-actions {
    @apply flex items-center gap-2;
  }

  .import-button {
    @apply flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500;
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

  .themes-list {
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

  .theme-card {
    @apply relative p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .theme-card.active {
    @apply bg-blue-50 border-blue-300 ring-2 ring-blue-200;
  }

  .theme-card.public {
    @apply border-green-200 bg-green-50;
  }

  .theme-card.private {
    @apply border-gray-200 bg-white;
  }

  .theme-preview {
    @apply flex items-center gap-3 mb-3;
  }

  .preview-icon {
    @apply text-2xl;
  }

  .preview-info {
    @apply flex-1;
  }

  .preview-title {
    @apply text-sm font-semibold text-gray-900;
  }

  .preview-version {
    @apply text-xs text-gray-500;
  }

  .theme-info {
    @apply flex-1;
  }

  .theme-header {
    @apply flex items-start justify-between mb-2;
  }

  .theme-name {
    @apply text-sm font-semibold text-gray-900 truncate flex-1;
  }

  .theme-badges {
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

  .theme-description {
    @apply text-xs text-gray-600 mb-3 line-clamp-2;
  }

  .theme-stats {
    @apply flex gap-4 text-xs text-gray-500 mb-2;
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

  .theme-meta {
    @apply flex flex-col gap-1 text-xs text-gray-500;
  }

  .created-date {
    @apply font-medium;
  }

  .updated-date {
    @apply text-gray-400;
  }

  .theme-actions {
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
