<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let loading = true;
  let pages: any[] = [];

  onMount(() => {
    loading = false;
  });

  function goToDesigner() {
    goto('/admin/designer');
  }

  function goToBlog() {
    goto('/admin/blog');
  }
</script>

<svelte:head>
  <title>Page Management - Linebasis</title>
</svelte:head>

<div class="pages-page">
  <div class="page-header">
    <div class="header-left">
      <h1 class="page-title">Page Management</h1>
      <p class="page-description">Manage your website pages and content</p>
    </div>
    <div class="header-actions">
      <button class="action-button secondary" on:click={goToDesigner}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
        Designer
      </button>
      <button class="action-button secondary" on:click={goToBlog}>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Blog
      </button>
      <button class="action-button primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Page
      </button>
    </div>
  </div>

  <div class="page-content">
    {#if loading}
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading pages...</p>
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 class="empty-title">No pages yet</h2>
        <p class="empty-description">
          Create your first page to get started with your website.
        </p>
        <button class="action-button primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create First Page
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .pages-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f9fafb;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
  }

  .header-left {
    flex: 1;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .page-description {
    color: #6b7280;
    margin: 0.25rem 0 0 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
    text-decoration: none;
  }

  .action-button.primary {
    background-color: #2563eb;
    color: white;
  }

  .action-button.primary:hover {
    background-color: #1d4ed8;
  }

  .action-button.secondary {
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .action-button.secondary:hover {
    background-color: #e5e7eb;
  }

  .page-content {
    flex: 1;
    padding: 1.5rem;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    height: 100%;
  }

  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
  }

  .empty-icon {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  .empty-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.5rem 0;
  }

  .empty-description {
    color: #6b7280;
    margin: 0 0 1.5rem 0;
  }
</style>