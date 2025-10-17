<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import Canvas from '$lib/components/canvas/Canvas.svelte';
  import Artboard from '$lib/components/canvas/Artboard.svelte';
  import Element from '$lib/components/canvas/Element.svelte';
  import ComponentLibrary from '$lib/components/ui/ComponentLibrary.svelte';
  import PageManager from '$lib/components/design/PageManager.svelte';
  import PublishingPanel from '$lib/components/design/PublishingPanel.svelte';
  import ComponentCreationDialog from '$lib/components/design/ComponentCreationDialog.svelte';
  import { 
    canvasState, 
    addArtboard, 
    insertBlock,
    selectedElementIds,
    convertSelectionToComponent
  } from '$lib/stores/design-store';
  import { currentEvents, undo, redo, canUndo, canRedo } from '$lib/stores/event-store';
  import type { CanvasConfig, Artboard as ArtboardType, CanvasElement } from '$lib/types/canvas';
  import type { ComponentWithLibrary } from '$lib/server/services/components.js';

  // Page management
  let pages: Array<{
    id: string;
    name: string;
    slug: string;
    status: 'draft' | 'published';
    isBlogTemplate: boolean;
    blogTemplateType?: string;
    artboards: ArtboardType[];
    elements: CanvasElement[];
  }> = [];

  let currentPageId: string | null = null;
  let currentPage = $derived(pages.find(p => p.id === currentPageId));

  // UI state
  let showComponentLibrary = true;
  let showPageManager = true;
  let showPublishingPanel = false;
  let showComponentCreationDialog = false;
  let loading = true;
  let saving = false;
  let error = '';
  let success = '';

  // Canvas configuration
  let canvasConfig: CanvasConfig = {
    backgroundColor: '#f0f0f0',
    maxArtboards: 10,
    showPerformanceWarning: true
  };

  // Component library data
  let components: ComponentWithLibrary[] = [];
  let componentsLoading = false;

  onMount(async () => {
    await checkAuth();
    await loadPages();
    await loadComponents();
    initializeCanvas();
  });

  onDestroy(() => {
    // Cleanup
  });

  async function checkAuth() {
    // TODO: Implement auth check
  }

  async function loadPages() {
    try {
      loading = true;
      // TODO: Load pages from API
      // For now, create a default page
      if (pages.length === 0) {
        const defaultPage = {
          id: 'page-1',
          name: 'Homepage',
          slug: 'home',
          status: 'draft' as const,
          isBlogTemplate: false,
          artboards: [
            {
              id: 'artboard-1',
              name: 'Desktop',
              x: 100,
              y: 100,
              width: 1200,
              height: 800,
              backgroundColor: '#ffffff',
              showGrid: true,
              gridSize: 20,
              isPublishTarget: true
            }
          ],
          elements: []
        };
        pages = [defaultPage];
        currentPageId = defaultPage.id;
      }
    } catch (err) {
      error = 'Failed to load pages';
      console.error('Error loading pages:', err);
    } finally {
      loading = false;
    }
  }

  async function loadComponents() {
    try {
      componentsLoading = true;
      const response = await fetch('/api/components');
      const result = await response.json();
      if (result.success) {
        components = result.data;
      }
    } catch (err) {
      console.error('Error loading components:', err);
    } finally {
      componentsLoading = false;
    }
  }

  function initializeCanvas() {
    if (currentPage) {
      // Set canvas state from current page
      canvasState.set({
        artboards: currentPage.artboards,
        elements: currentPage.elements,
        selectedElementIds: []
      });
    }
  }

  // Page management functions
  function createNewPage() {
    const newPage = {
      id: `page-${Date.now()}`,
      name: 'New Page',
      slug: '',
      status: 'draft' as const,
      isBlogTemplate: false,
      artboards: [
        {
          id: `artboard-${Date.now()}`,
          name: 'Desktop',
          x: 100,
          y: 100,
          width: 1200,
          height: 800,
          backgroundColor: '#ffffff',
          showGrid: true,
          gridSize: 20,
          isPublishTarget: true
        }
      ],
      elements: []
    };
    pages = [...pages, newPage];
    currentPageId = newPage.id;
    initializeCanvas();
  }

  function selectPage(pageId: string) {
    currentPageId = pageId;
    initializeCanvas();
  }

  function deletePage(pageId: string) {
    if (pages.length <= 1) {
      error = 'Cannot delete the last page';
      return;
    }
    pages = pages.filter(p => p.id !== pageId);
    if (currentPageId === pageId) {
      currentPageId = pages[0]?.id || null;
      initializeCanvas();
    }
  }

  function duplicatePage(pageId: string) {
    const pageToDuplicate = pages.find(p => p.id === pageId);
    if (pageToDuplicate) {
      const duplicatedPage = {
        ...pageToDuplicate,
        id: `page-${Date.now()}`,
        name: `${pageToDuplicate.name} Copy`,
        slug: '',
        status: 'draft' as const,
        artboards: pageToDuplicate.artboards.map(artboard => ({
          ...artboard,
          id: `artboard-${Date.now()}-${Math.random()}`,
          x: artboard.x + 50,
          y: artboard.y + 50
        }))
      };
      pages = [...pages, duplicatedPage];
    }
  }

  function updatePageName(pageId: string, name: string) {
    pages = pages.map(p => p.id === pageId ? { ...p, name } : p);
  }

  function updatePageSlug(pageId: string, slug: string) {
    pages = pages.map(p => p.id === pageId ? { ...p, slug } : p);
  }

  function toggleBlogTemplate(pageId: string) {
    pages = pages.map(p => 
      p.id === pageId 
        ? { 
            ...p, 
            isBlogTemplate: !p.isBlogTemplate,
            blogTemplateType: !p.isBlogTemplate ? 'post' : undefined
          } 
        : p
    );
  }

  // Component functions
  function handleComponentSelect(component: ComponentWithLibrary) {
    // TODO: Insert component into current artboard
    console.log('Selected component:', component);
  }

  function handleCreateComponent() {
    showComponentCreationDialog = true;
  }

  function handleConvertToComponent() {
    if (selectedElementIds.length === 0) {
      error = 'Please select elements to convert to component';
      return;
    }
    showComponentCreationDialog = true;
  }

  async function handleComponentCreate(componentData: {
    name: string;
    description: string;
    category: string;
    elements: CanvasElement[];
  }) {
    try {
      saving = true;
      const response = await fetch('/api/components/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(componentData),
      });

      const result = await response.json();
      if (result.success) {
        success = 'Component created successfully';
        showComponentCreationDialog = false;
        // Refresh components list
        await loadComponents();
      } else {
        error = result.error || 'Failed to create component';
      }
    } catch (err) {
      error = 'Failed to create component';
      console.error('Error creating component:', err);
    } finally {
      saving = false;
    }
  }

  // Publishing functions
  async function publishPage(pageId: string, slug: string) {
    try {
      saving = true;
      // TODO: Implement publishing logic
      pages = pages.map(p => 
        p.id === pageId 
          ? { ...p, status: 'published', slug } 
          : p
      );
      success = 'Page published successfully';
    } catch (err) {
      error = 'Failed to publish page';
      console.error('Error publishing page:', err);
    } finally {
      saving = false;
    }
  }

  async function unpublishPage(pageId: string) {
    try {
      saving = true;
      // TODO: Implement unpublishing logic
      pages = pages.map(p => 
        p.id === pageId 
          ? { ...p, status: 'draft' } 
          : p
      );
      success = 'Page unpublished successfully';
    } catch (err) {
      error = 'Failed to unpublish page';
      console.error('Error unpublishing page:', err);
    } finally {
      saving = false;
    }
  }

  // Keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'z':
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 's':
          event.preventDefault();
          // TODO: Save page
          break;
        case 'n':
          event.preventDefault();
          createNewPage();
          break;
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="unified-designer">
  <!-- Top Navigation -->
  <header class="designer-header">
    <div class="header-left">
      <h1 class="designer-title">Designer</h1>
      <div class="page-selector">
        <select bind:value={currentPageId} on:change={() => currentPageId && selectPage(currentPageId)}>
          {#each pages as page}
            <option value={page.id}>{page.name}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <div class="header-center">
      <div class="toolbar">
        <button type="button" on:click={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button type="button" on:click={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>
        <div class="separator"></div>
        <button type="button" on:click={handleConvertToComponent} disabled={selectedElementIds.length === 0} title="Convert to Component">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Convert to Component
        </button>
      </div>
    </div>

    <div class="header-right">
      <button 
        type="button" 
        class="publish-button"
        on:click={() => showPublishingPanel = true}
        disabled={!currentPage}
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        Publish
      </button>
    </div>
  </header>

  <!-- Main Content -->
  <div class="designer-content">
    <!-- Left Sidebar - Page Manager -->
    {#if showPageManager}
      <aside class="sidebar left-sidebar">
        <PageManager
          {pages}
          {currentPageId}
          onPageSelect={selectPage}
          onPageCreate={createNewPage}
          onPageDelete={deletePage}
          onPageDuplicate={duplicatePage}
          onPageNameUpdate={updatePageName}
          onPageSlugUpdate={updatePageSlug}
          onToggleBlogTemplate={toggleBlogTemplate}
        />
      </aside>
    {/if}

    <!-- Center - Canvas Area -->
    <main class="canvas-area">
      {#if loading}
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading designer...</p>
        </div>
      {:else if currentPage}
        <Canvas {config}>
          {#each currentPage.artboards as artboard (artboard.id)}
            <Artboard
              {artboard}
              bind:selectedElementIds
            >
              {#each currentPage.elements.filter(el => el.artboardId === artboard.id) as element (element.id)}
                <Element
                  {element}
                  bind:selectedElementIds
                />
              {/each}
            </Artboard>
          {/each}
        </Canvas>
      {:else}
        <div class="empty-state">
          <div class="empty-icon">🎨</div>
          <h3>No page selected</h3>
          <p>Create a new page to start designing</p>
          <button type="button" on:click={createNewPage} class="create-page-button">
            Create Page
          </button>
        </div>
      {/if}
    </main>

    <!-- Right Sidebar - Component Library -->
    {#if showComponentLibrary}
      <aside class="sidebar right-sidebar">
        <ComponentLibrary
          {components}
          loading={componentsLoading}
          onComponentSelect={handleComponentSelect}
          onCreateComponent={handleCreateComponent}
        />
      </aside>
    {/if}
  </div>

  <!-- Publishing Panel Modal -->
  {#if showPublishingPanel && currentPage}
    <PublishingPanel
      page={currentPage}
      onPublish={publishPage}
      onUnpublish={unpublishPage}
      onClose={() => showPublishingPanel = false}
    />
  {/if}

  <!-- Component Creation Dialog -->
  <ComponentCreationDialog
    isOpen={showComponentCreationDialog}
    onClose={() => showComponentCreationDialog = false}
    onCreate={handleComponentCreate}
  />

  <!-- Notifications -->
  {#if error}
    <div class="notification error">
      <span>{error}</span>
      <button type="button" on:click={() => error = ''}>×</button>
    </div>
  {/if}

  {#if success}
    <div class="notification success">
      <span>{success}</span>
      <button type="button" on:click={() => success = ''}>×</button>
    </div>
  {/if}
</div>

<style>
  .unified-designer {
    @apply h-screen flex flex-col bg-gray-100;
  }

  .designer-header {
    @apply flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm;
  }

  .header-left {
    @apply flex items-center gap-4;
  }

  .designer-title {
    @apply text-xl font-semibold text-gray-900;
  }

  .page-selector select {
    @apply px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .header-center {
    @apply flex-1 flex justify-center;
  }

  .toolbar {
    @apply flex items-center gap-2;
  }

  .toolbar button {
    @apply p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .separator {
    @apply w-px h-6 bg-gray-300 mx-2;
  }

  .header-right {
    @apply flex items-center gap-2;
  }

  .publish-button {
    @apply flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .designer-content {
    @apply flex-1 flex overflow-hidden;
  }

  .sidebar {
    @apply w-80 bg-white border-r border-gray-200 flex flex-col;
  }

  .left-sidebar {
    @apply border-r;
  }

  .right-sidebar {
    @apply border-l;
  }

  .canvas-area {
    @apply flex-1 overflow-hidden;
  }

  .loading-state {
    @apply flex flex-col items-center justify-center h-full text-gray-500;
  }

  .loading-spinner {
    @apply w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4;
  }

  .empty-state {
    @apply flex flex-col items-center justify-center h-full text-center;
  }

  .empty-icon {
    @apply text-6xl mb-4;
  }

  .empty-state h3 {
    @apply text-xl font-semibold text-gray-900 mb-2;
  }

  .empty-state p {
    @apply text-gray-500 mb-4;
  }

  .create-page-button {
    @apply px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700;
  }

  .notification {
    @apply fixed top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg z-50;
  }

  .notification.error {
    @apply bg-red-100 text-red-800 border border-red-200;
  }

  .notification.success {
    @apply bg-green-100 text-green-800 border border-green-200;
  }

  .notification button {
    @apply text-lg font-bold hover:opacity-70;
  }
</style>
