<script lang="ts">
  export let message: string = 'Loading...';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let showMessage: boolean = true;
  export let overlay: boolean = false;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const messageSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
</script>

<div class="loading-state" class:overlay={overlay}>
  <div class="loading-content">
    <div class="loading-spinner" class:size-{size}>
      <div class="spinner-ring"></div>
    </div>
    
    {#if showMessage}
      <p class="loading-message" class:size-{size}>{message}</p>
    {/if}
  </div>
</div>

<style>
  .loading-state {
    @apply flex items-center justify-center;
  }

  .loading-state.overlay {
    @apply fixed inset-0 bg-white bg-opacity-75 z-50;
  }

  .loading-content {
    @apply flex flex-col items-center gap-3;
  }

  .loading-spinner {
    @apply relative;
  }

  .loading-spinner.size-sm {
    @apply w-4 h-4;
  }

  .loading-spinner.size-md {
    @apply w-8 h-8;
  }

  .loading-spinner.size-lg {
    @apply w-12 h-12;
  }

  .spinner-ring {
    @apply w-full h-full border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin;
  }

  .loading-message {
    @apply text-gray-600 font-medium;
  }

  .loading-message.size-sm {
    @apply text-sm;
  }

  .loading-message.size-md {
    @apply text-base;
  }

  .loading-message.size-lg {
    @apply text-lg;
  }
</style>
