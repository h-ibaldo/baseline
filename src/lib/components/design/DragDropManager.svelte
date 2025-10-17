<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import type { CanvasElement } from '$lib/types/canvas';

  export let elements: CanvasElement[] = [];
  export let selectedElementIds: string[] = [];
  export let isEnabled: boolean = true;

  const dispatch = createEventDispatcher();

  let dragState = {
    isDragging: false,
    dragType: null as 'element' | 'component' | null,
    dragData: null as any,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    dropTarget: null as string | null,
    dragPreview: null as HTMLElement | null,
  };

  let containerElement: HTMLDivElement;

  onMount(() => {
    if (containerElement) {
      containerElement.addEventListener('dragover', handleDragOver);
      containerElement.addEventListener('drop', handleDrop);
      containerElement.addEventListener('dragenter', handleDragEnter);
      containerElement.addEventListener('dragleave', handleDragLeave);
    }
  });

  onDestroy(() => {
    if (containerElement) {
      containerElement.removeEventListener('dragover', handleDragOver);
      containerElement.removeEventListener('drop', handleDrop);
      containerElement.removeEventListener('dragenter', handleDragEnter);
      containerElement.removeEventListener('dragleave', handleDragLeave);
    }
  });

  function handleDragOver(event: DragEvent) {
    if (!isEnabled) return;
    
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    
    if (dragState.isDragging) {
      dragState.currentPosition = { x: event.clientX, y: event.clientY };
      updateDragPreview();
    }
  }

  function handleDrop(event: DragEvent) {
    if (!isEnabled) return;
    
    event.preventDefault();
    
    try {
      const data = JSON.parse(event.dataTransfer!.getData('application/json'));
      
      if (data.type === 'element') {
        handleElementDrop(data, event);
      } else if (data.type === 'component') {
        handleComponentDrop(data, event);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
    
    cleanupDragState();
  }

  function handleDragEnter(event: DragEvent) {
    if (!isEnabled) return;
    
    event.preventDefault();
    const target = event.target as HTMLElement;
    const elementId = target.closest('[data-element-id]')?.getAttribute('data-element-id');
    
    if (elementId) {
      dragState.dropTarget = elementId;
      target.classList.add('drop-target');
    }
  }

  function handleDragLeave(event: DragEvent) {
    if (!isEnabled) return;
    
    const target = event.target as HTMLElement;
    target.classList.remove('drop-target');
    
    if (!target.contains(event.relatedTarget as Node)) {
      dragState.dropTarget = null;
    }
  }

  function handleElementDrop(data: any, event: DragEvent) {
    const elementId = data.elementId;
    const newPosition = getCanvasPosition(event);
    
    // Update element position
    const updatedElements = elements.map(el => 
      el.id === elementId 
        ? { ...el, x: newPosition.x, y: newPosition.y }
        : el
    );
    
    dispatch('elementsUpdate', { elements: updatedElements });
    dispatch('elementMove', { elementId, position: newPosition });
  }

  function handleComponentDrop(data: any, event: DragEvent) {
    const component = data.component;
    const position = getCanvasPosition(event);
    
    // Create new element from component
    const newElement: CanvasElement = {
      id: `element-${Date.now()}`,
      type: component.type,
      x: position.x,
      y: position.y,
      width: component.defaultWidth || 200,
      height: component.defaultHeight || 100,
      artboardId: data.artboardId,
      properties: component.defaultProperties || {},
      zIndex: elements.length + 1,
    };
    
    const updatedElements = [...elements, newElement];
    dispatch('elementsUpdate', { elements: updatedElements });
    dispatch('elementCreate', { element: newElement });
  }

  function getCanvasPosition(event: DragEvent) {
    const rect = containerElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function updateDragPreview() {
    if (dragState.dragPreview) {
      const deltaX = dragState.currentPosition.x - dragState.startPosition.x;
      const deltaY = dragState.currentPosition.y - dragState.startPosition.y;
      
      dragState.dragPreview.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
  }

  function cleanupDragState() {
    dragState.isDragging = false;
    dragState.dragType = null;
    dragState.dragData = null;
    dragState.dropTarget = null;
    
    if (dragState.dragPreview) {
      dragState.dragPreview.remove();
      dragState.dragPreview = null;
    }
  }

  function startElementDrag(elementId: string, event: DragEvent) {
    if (!isEnabled) return;
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    dragState.isDragging = true;
    dragState.dragType = 'element';
    dragState.dragData = { elementId, element };
    dragState.startPosition = { x: event.clientX, y: event.clientY };
    dragState.currentPosition = { x: event.clientX, y: event.clientY };
    
    // Create drag preview
    createDragPreview(element);
    
    // Set drag data
    event.dataTransfer!.setData('application/json', JSON.stringify({
      type: 'element',
      elementId,
      element,
    }));
    
    event.dataTransfer!.effectAllowed = 'move';
    
    dispatch('dragStart', { elementId, element });
  }

  function startComponentDrag(component: any, artboardId: string, event: DragEvent) {
    if (!isEnabled) return;
    
    dragState.isDragging = true;
    dragState.dragType = 'component';
    dragState.dragData = { component, artboardId };
    dragState.startPosition = { x: event.clientX, y: event.clientY };
    dragState.currentPosition = { x: event.clientX, y: event.clientY };
    
    // Create drag preview
    createComponentDragPreview(component);
    
    // Set drag data
    event.dataTransfer!.setData('application/json', JSON.stringify({
      type: 'component',
      component,
      artboardId,
    }));
    
    event.dataTransfer!.effectAllowed = 'copy';
    
    dispatch('componentDragStart', { component, artboardId });
  }

  function createDragPreview(element: CanvasElement) {
    const preview = document.createElement('div');
    preview.className = 'drag-preview element-preview';
    preview.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${element.width}px;
      height: ${element.height}px;
      background: rgba(59, 130, 246, 0.1);
      border: 2px dashed #3b82f6;
      border-radius: 4px;
      pointer-events: none;
      z-index: 1000;
      opacity: 0.8;
    `;
    
    document.body.appendChild(preview);
    dragState.dragPreview = preview;
  }

  function createComponentDragPreview(component: any) {
    const preview = document.createElement('div');
    preview.className = 'drag-preview component-preview';
    preview.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${component.defaultWidth || 200}px;
      height: ${component.defaultHeight || 100}px;
      background: rgba(16, 185, 129, 0.1);
      border: 2px dashed #10b981;
      border-radius: 4px;
      pointer-events: none;
      z-index: 1000;
      opacity: 0.8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #10b981;
      font-weight: 500;
    `;
    
    preview.textContent = component.name || 'Component';
    document.body.appendChild(preview);
    dragState.dragPreview = preview;
  }

  function handleElementDragEnd(elementId: string) {
    cleanupDragState();
    dispatch('dragEnd', { elementId });
  }

  function handleComponentDragEnd(component: any) {
    cleanupDragState();
    dispatch('componentDragEnd', { component });
  }

  // Expose methods for parent components
  export { startElementDrag, startComponentDrag, handleElementDragEnd, handleComponentDragEnd };
</script>

<div 
  bind:this={containerElement}
  class="drag-drop-manager"
  class:enabled={isEnabled}
>
  <slot />
</div>

<style>
  .drag-drop-manager {
    @apply relative w-full h-full;
  }

  .drag-drop-manager.enabled {
    @apply cursor-move;
  }

  .drop-target {
    @apply ring-2 ring-blue-500 ring-opacity-50;
  }

  :global(.drag-preview) {
    transition: transform 0.1s ease-out;
  }

  :global(.element-preview) {
    background: linear-gradient(45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%),
                linear-gradient(-45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  }

  :global(.component-preview) {
    background: linear-gradient(45deg, rgba(16, 185, 129, 0.1) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(16, 185, 129, 0.1) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, rgba(16, 185, 129, 0.1) 75%),
                linear-gradient(-45deg, transparent 75%, rgba(16, 185, 129, 0.1) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  }
</style>
