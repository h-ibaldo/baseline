<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import type { CanvasConfig, Artboard as ArtboardType, CanvasElement } from '$lib/types/canvas';

  export let config: CanvasConfig;
  export let artboards: ArtboardType[] = [];
  export let elements: CanvasElement[] = [];
  export let selectedElementIds: string[] = [];
  export let isVisible: boolean = true;

  const dispatch = createEventDispatcher();

  let canvasRef: HTMLDivElement;
  let observer: IntersectionObserver;
  let isInView = false;
  let hasLoaded = false;

  onMount(() => {
    // Set up intersection observer for lazy loading
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInView = entry.isIntersecting;
          if (isInView && !hasLoaded) {
            hasLoaded = true;
            dispatch('load');
          }
        });
      },
      {
        rootMargin: '100px', // Load 100px before entering viewport
        threshold: 0.1
      }
    );

    if (canvasRef) {
      observer.observe(canvasRef);
    }
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  function handleElementSelect(elementId: string) {
    dispatch('elementSelect', { elementId });
  }

  function handleElementDeselect(elementId: string) {
    dispatch('elementDeselect', { elementId });
  }

  function handleElementUpdate(elementId: string, updates: Partial<CanvasElement>) {
    dispatch('elementUpdate', { elementId, updates });
  }

  function handleArtboardUpdate(artboardId: string, updates: Partial<ArtboardType>) {
    dispatch('artboardUpdate', { artboardId, updates });
  }
</script>

<div 
  bind:this={canvasRef}
  class="lazy-canvas"
  class:loaded={hasLoaded}
  class:visible={isVisible}
>
  {#if hasLoaded}
    <!-- Canvas Content -->
    <div class="canvas-content">
      {#each artboards as artboard (artboard.id)}
        <div 
          class="artboard-container"
          style="
            position: absolute;
            left: {artboard.x}px;
            top: {artboard.y}px;
            width: {artboard.width}px;
            height: {artboard.height}px;
            background-color: {artboard.backgroundColor};
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          "
        >
          <!-- Artboard Grid -->
          {#if artboard.showGrid}
            <div 
              class="artboard-grid"
              style="
                background-image: 
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
                background-size: {artboard.gridSize}px {artboard.gridSize}px;
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
              "
            ></div>
          {/if}

          <!-- Artboard Elements -->
          {#each elements.filter(el => el.artboardId === artboard.id) as element (element.id)}
            <div
              class="canvas-element"
              class:selected={selectedElementIds.includes(element.id)}
              style="
                position: absolute;
                left: {element.x}px;
                top: {element.y}px;
                width: {element.width}px;
                height: {element.height}px;
                z-index: {element.zIndex || 1};
                cursor: pointer;
              "
              on:click={() => handleElementSelect(element.id)}
              on:contextmenu={(e) => {
                e.preventDefault();
                dispatch('elementContextMenu', { elementId: element.id, event: e });
              }}
            >
              <!-- Element Content -->
              <div class="element-content">
                {#if element.type === 'text'}
                  <div 
                    class="text-element"
                    style="
                      font-family: {element.properties?.fontFamily || 'Inter, sans-serif'};
                      font-size: {element.properties?.fontSize || '16px'};
                      font-weight: {element.properties?.fontWeight || '400'};
                      color: {element.properties?.color || '#000000'};
                      text-align: {element.properties?.textAlign || 'left'};
                      line-height: {element.properties?.lineHeight || '1.5'};
                    "
                  >
                    {element.properties?.text || 'Text Element'}
                  </div>
                {:else if element.type === 'image'}
                  <div class="image-element">
                    {#if element.properties?.src}
                      <img 
                        src={element.properties.src} 
                        alt={element.properties?.alt || ''}
                        style="width: 100%; height: 100%; object-fit: cover;"
                      />
                    {:else}
                      <div class="image-placeholder">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Image</span>
                      </div>
                    {/if}
                  </div>
                {:else if element.type === 'button'}
                  <button 
                    class="button-element"
                    style="
                      width: 100%;
                      height: 100%;
                      background-color: {element.properties?.backgroundColor || '#3b82f6'};
                      color: {element.properties?.color || '#ffffff'};
                      border: none;
                      border-radius: {element.properties?.borderRadius || '6px'};
                      font-size: {element.properties?.fontSize || '14px'};
                      font-weight: {element.properties?.fontWeight || '500'};
                      cursor: pointer;
                    "
                  >
                    {element.properties?.text || 'Button'}
                  </button>
                {:else if element.type === 'container'}
                  <div 
                    class="container-element"
                    style="
                      width: 100%;
                      height: 100%;
                      background-color: {element.properties?.backgroundColor || 'transparent'};
                      border: {element.properties?.borderWidth || '1px'} solid {element.properties?.borderColor || '#e5e7eb'};
                      border-radius: {element.properties?.borderRadius || '0px'};
                      padding: {element.properties?.padding || '0px'};
                    "
                  >
                    {element.properties?.content || 'Container'}
                  </div>
                {:else}
                  <div class="unknown-element">
                    <span>{element.type}</span>
                  </div>
                {/if}
              </div>

              <!-- Element Selection Indicator -->
              {#if selectedElementIds.includes(element.id)}
                <div class="selection-indicator">
                  <div class="selection-handles">
                    <div class="handle handle-nw"></div>
                    <div class="handle handle-ne"></div>
                    <div class="handle handle-sw"></div>
                    <div class="handle handle-se"></div>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {:else}
    <!-- Loading Placeholder -->
    <div class="loading-placeholder">
      <div class="loading-spinner"></div>
      <p>Loading canvas...</p>
    </div>
  {/if}
</div>

<style>
  .lazy-canvas {
    @apply relative w-full h-full overflow-hidden;
  }

  .lazy-canvas.loaded {
    @apply opacity-100;
  }

  .lazy-canvas:not(.loaded) {
    @apply opacity-0;
  }

  .canvas-content {
    @apply relative w-full h-full;
  }

  .artboard-container {
    @apply relative;
  }

  .artboard-grid {
    @apply opacity-30;
  }

  .canvas-element {
    @apply relative;
  }

  .canvas-element.selected {
    @apply ring-2 ring-blue-500;
  }

  .element-content {
    @apply w-full h-full;
  }

  .text-element {
    @apply p-2;
  }

  .image-element {
    @apply w-full h-full flex items-center justify-center;
  }

  .image-placeholder {
    @apply flex flex-col items-center justify-center w-full h-full bg-gray-100 text-gray-400;
  }

  .button-element {
    @apply transition-colors hover:opacity-90;
  }

  .container-element {
    @apply flex items-center justify-center;
  }

  .unknown-element {
    @apply flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-sm;
  }

  .selection-indicator {
    @apply absolute inset-0 pointer-events-none;
  }

  .selection-handles {
    @apply absolute inset-0;
  }

  .handle {
    @apply absolute w-2 h-2 bg-blue-500 border border-white rounded-full;
  }

  .handle-nw {
    @apply top-0 left-0 transform -translate-x-1 -translate-y-1;
  }

  .handle-ne {
    @apply top-0 right-0 transform translate-x-1 -translate-y-1;
  }

  .handle-sw {
    @apply bottom-0 left-0 transform -translate-x-1 translate-y-1;
  }

  .handle-se {
    @apply bottom-0 right-0 transform translate-x-1 translate-y-1;
  }

  .loading-placeholder {
    @apply flex flex-col items-center justify-center h-full text-gray-500;
  }

  .loading-spinner {
    @apply w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4;
  }
</style>
