<script lang="ts">
  import { onMount } from 'svelte';
  import Toast from './Toast.svelte';

  interface ToastData {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
    persistent?: boolean;
  }

  let toasts: ToastData[] = [];

  onMount(() => {
    // Set up global toast functions
    window.showToast = (toast: Omit<ToastData, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      toasts = [...toasts, { ...toast, id }];
    };

    window.showSuccess = (message: string, title?: string) => {
      window.showToast({ type: 'success', message, title });
    };

    window.showError = (message: string, title?: string) => {
      window.showToast({ type: 'error', message, title, persistent: true });
    };

    window.showWarning = (message: string, title?: string) => {
      window.showToast({ type: 'warning', message, title });
    };

    window.showInfo = (message: string, title?: string) => {
      window.showToast({ type: 'info', message, title });
    };

    return () => {
      // Clean up global functions
      delete window.showToast;
      delete window.showSuccess;
      delete window.showError;
      delete window.showWarning;
      delete window.showInfo;
    };
  });

  function handleDismiss(toastId: string) {
    toasts = toasts.filter(toast => toast.id !== toastId);
  }
</script>

<div class="toast-manager">
  {#each toasts as toast (toast.id)}
    <Toast
      type={toast.type}
      title={toast.title}
      message={toast.message}
      duration={toast.duration}
      persistent={toast.persistent}
      on:dismiss={() => handleDismiss(toast.id)}
    />
  {/each}
</div>

<style>
  .toast-manager {
    @apply fixed top-4 right-4 z-50 space-y-2;
  }
</style>
