<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  export let fallback: string = 'Something went wrong. Please try again.';
  export let showDetails: boolean = false;

  const dispatch = createEventDispatcher();

  let error: Error | null = null;
  let errorInfo: any = null;
  let hasError = false;

  onMount(() => {
    // Set up global error handler
    const handleError = (event: ErrorEvent) => {
      error = new Error(event.message);
      errorInfo = {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      };
      hasError = true;
      dispatch('error', { error, errorInfo });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      error = new Error(event.reason?.message || 'Unhandled promise rejection');
      errorInfo = {
        reason: event.reason,
        stack: event.reason?.stack
      };
      hasError = true;
      dispatch('error', { error, errorInfo });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  });

  function handleRetry() {
    hasError = false;
    error = null;
    errorInfo = null;
    dispatch('retry');
  }

  function handleReportError() {
    // TODO: Implement error reporting
    console.error('Error reported:', error, errorInfo);
    dispatch('report', { error, errorInfo });
  }

  function toggleDetails() {
    showDetails = !showDetails;
  }
</script>

{#if hasError}
  <div class="error-boundary">
    <div class="error-content">
      <div class="error-icon">
        <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <div class="error-message">
        <h3 class="error-title">Oops! Something went wrong</h3>
        <p class="error-description">{fallback}</p>
      </div>

      <div class="error-actions">
        <button
          type="button"
          class="retry-button"
          on:click={handleRetry}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>

        <button
          type="button"
          class="details-button"
          on:click={toggleDetails}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {showDetails ? 'Hide' : 'Show'} Details
        </button>

        <button
          type="button"
          class="report-button"
          on:click={handleReportError}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Report Error
        </button>
      </div>

      {#if showDetails && error}
        <div class="error-details">
          <h4 class="details-title">Error Details</h4>
          <div class="details-content">
            <div class="detail-item">
              <strong>Message:</strong>
              <code class="error-code">{error.message}</code>
            </div>
            
            {#if errorInfo?.stack}
              <div class="detail-item">
                <strong>Stack Trace:</strong>
                <pre class="error-stack">{errorInfo.stack}</pre>
              </div>
            {/if}

            {#if errorInfo?.filename}
              <div class="detail-item">
                <strong>File:</strong>
                <code class="error-code">{errorInfo.filename}:{errorInfo.lineno}:{errorInfo.colno}</code>
              </div>
            {/if}

            {#if errorInfo?.reason}
              <div class="detail-item">
                <strong>Reason:</strong>
                <code class="error-code">{JSON.stringify(errorInfo.reason, null, 2)}</code>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .error-boundary {
    @apply min-h-screen flex items-center justify-center bg-gray-50 p-4;
  }

  .error-content {
    @apply max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center;
  }

  .error-icon {
    @apply flex justify-center mb-4;
  }

  .error-message {
    @apply mb-6;
  }

  .error-title {
    @apply text-xl font-semibold text-gray-900 mb-2;
  }

  .error-description {
    @apply text-gray-600;
  }

  .error-actions {
    @apply flex flex-col gap-2 mb-4;
  }

  .retry-button {
    @apply flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .details-button {
    @apply flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500;
  }

  .report-button {
    @apply flex items-center justify-center gap-2 px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500;
  }

  .error-details {
    @apply mt-4 p-4 bg-gray-50 rounded-lg text-left;
  }

  .details-title {
    @apply text-sm font-semibold text-gray-900 mb-3;
  }

  .details-content {
    @apply space-y-2;
  }

  .detail-item {
    @apply text-sm;
  }

  .error-code {
    @apply block mt-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-x-auto;
  }

  .error-stack {
    @apply block mt-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-x-auto max-h-32;
  }
</style>
