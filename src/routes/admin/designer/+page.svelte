<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let loading = true;

  onMount(() => {
    loading = false;
  });

  function goToBlog() {
    goto('/admin/blog');
  }

  function goToPages() {
    goto('/admin/pages');
  }
</script>

<svelte:head>
  <title>Designer - Linebasis</title>
</svelte:head>

<div class="designer-page">
  {#if loading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading designer...</p>
    </div>
  {:else}
    <div class="designer-header">
      <div class="header-left">
        <h1 class="designer-title">Unified Designer</h1>
        <p class="designer-subtitle">Design, edit, and publish all in one interface</p>
      </div>
      <div class="header-actions">
        <button class="action-button secondary" on:click={goToBlog}>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Manage Blog
        </button>
        <button class="action-button primary" on:click={goToPages}>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Page
        </button>
      </div>
    </div>

    <div class="designer-content">
      <div class="coming-soon">
        <div class="coming-soon-icon">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        </div>
        <h2 class="coming-soon-title">Unified Designer Coming Soon</h2>
        <p class="coming-soon-description">
          The unified designer interface is being built. This will be a powerful tool that combines 
          design, editing, and publishing in one seamless experience.
        </p>
        <div class="coming-soon-features">
          <div class="feature-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            <span>Multi-page canvas</span>
          </div>
          <div class="feature-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Component system</span>
          </div>
          <div class="feature-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Instant publishing</span>
          </div>
          <div class="feature-item">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            <span>Style libraries</span>
          </div>
        </div>
        <div class="coming-soon-actions">
          <button class="action-button primary" on:click={goToPages}>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Start with Pages
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .designer-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f9fafb;
  }

  .designer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .designer-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .designer-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
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

  .designer-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
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

  .coming-soon {
    text-align: center;
    max-width: 32rem;
  }

  .coming-soon-icon {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  .coming-soon-title {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 1rem;
  }

  .coming-soon-description {
    font-size: 1.125rem;
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .coming-soon-features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: white;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    font-size: 0.875rem;
    color: #374151;
  }

  .coming-soon-actions {
    display: flex;
    justify-content: center;
  }
</style>