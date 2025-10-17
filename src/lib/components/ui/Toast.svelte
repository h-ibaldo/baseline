<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
  export let title: string = '';
  export let message: string = '';
  export let duration: number = 5000;
  export let persistent: boolean = false;

  const dispatch = createEventDispatcher();

  let isVisible = false;
  let progress = 100;
  let timeoutId: number;

  onMount(() => {
    // Show toast with animation
    setTimeout(() => {
      isVisible = true;
    }, 10);

    // Auto-dismiss if not persistent
    if (!persistent && duration > 0) {
      startProgress();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });

  function startProgress() {
    const interval = 50; // Update every 50ms
    const totalSteps = duration / interval;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      progress = 100 - (currentStep / totalSteps) * 100;

      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);
        dismiss();
      }
    }, interval);
  }

  function dismiss() {
    isVisible = false;
    setTimeout(() => {
      dispatch('dismiss');
    }, 300); // Wait for animation to complete
  }

  function handleDismiss() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    dismiss();
  }

  function getIcon() {
    switch (type) {
      case 'success':
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
      case 'error':
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>`;
      case 'warning':
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>`;
      case 'info':
      default:
        return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
    }
  }
</script>

<div 
  class="toast"
  class:visible={isVisible}
  class:type-{type}
  on:click={handleDismiss}
  role="alert"
>
  <div class="toast-content">
    <div class="toast-icon">
      {@html getIcon()}
    </div>
    
    <div class="toast-body">
      {#if title}
        <h4 class="toast-title">{title}</h4>
      {/if}
      {#if message}
        <p class="toast-message">{message}</p>
      {/if}
    </div>

    <button
      type="button"
      class="toast-close"
      on:click={handleDismiss}
      aria-label="Dismiss notification"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  {#if !persistent && duration > 0}
    <div class="toast-progress">
      <div 
        class="progress-bar"
        style="width: {progress}%"
      ></div>
    </div>
  {/if}
</div>

<style>
  .toast {
    @apply fixed top-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 transform translate-x-full opacity-0 transition-all duration-300 ease-in-out z-50;
  }

  .toast.visible {
    @apply translate-x-0 opacity-100;
  }

  .toast.type-success {
    @apply border-green-200 bg-green-50;
  }

  .toast.type-error {
    @apply border-red-200 bg-red-50;
  }

  .toast.type-warning {
    @apply border-yellow-200 bg-yellow-50;
  }

  .toast.type-info {
    @apply border-blue-200 bg-blue-50;
  }

  .toast-content {
    @apply flex items-start gap-3 p-4;
  }

  .toast-icon {
    @apply flex-shrink-0 mt-0.5;
  }

  .toast.type-success .toast-icon {
    @apply text-green-600;
  }

  .toast.type-error .toast-icon {
    @apply text-red-600;
  }

  .toast.type-warning .toast-icon {
    @apply text-yellow-600;
  }

  .toast.type-info .toast-icon {
    @apply text-blue-600;
  }

  .toast-body {
    @apply flex-1 min-w-0;
  }

  .toast-title {
    @apply text-sm font-semibold text-gray-900 mb-1;
  }

  .toast-message {
    @apply text-sm text-gray-600;
  }

  .toast-close {
    @apply flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors;
  }

  .toast-progress {
    @apply h-1 bg-gray-200 rounded-b-lg overflow-hidden;
  }

  .progress-bar {
    @apply h-full bg-gray-400 transition-all duration-50 ease-linear;
  }

  .toast.type-success .progress-bar {
    @apply bg-green-500;
  }

  .toast.type-error .progress-bar {
    @apply bg-red-500;
  }

  .toast.type-warning .progress-bar {
    @apply bg-yellow-500;
  }

  .toast.type-info .progress-bar {
    @apply bg-blue-500;
  }
</style>
