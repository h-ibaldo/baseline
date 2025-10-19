<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let loading = true;
  let user = { name: 'Admin User' };

  onMount(() => {
    loading = false;
  });

  function goToDesigner() {
    goto('/admin/designer');
  }

  function goToBlog() {
    goto('/admin/blog');
  }

  function goToPages() {
    goto('/admin/pages');
  }
</script>

<svelte:head>
  <title>Admin Dashboard - Linebasis</title>
</svelte:head>

<div class="admin-page">
  {#if loading}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading dashboard...</p>
    </div>
  {:else}
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Welcome back, {user.name}!</h1>
        <p class="page-description">Manage your website and content</p>
      </div>
    </div>

    <div class="page-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📄</div>
          <div class="stat-value">0</div>
          <div class="stat-label">Total Pages</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🖼️</div>
          <div class="stat-value">0</div>
          <div class="stat-label">Media Files</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-value">0</div>
          <div class="stat-label">Blog Posts</div>
        </div>
      </div>

      <div class="quick-actions">
        <h3 class="section-title">Quick Actions</h3>
        <div class="action-grid">
          <button class="action-card" on:click={goToDesigner}>
            <div class="action-icon">✨</div>
            <div class="action-title">Open Designer</div>
            <div class="action-desc">Design pages and components</div>
          </button>

          <button class="action-card" on:click={goToPages}>
            <div class="action-icon">📋</div>
            <div class="action-title">Manage Pages</div>
            <div class="action-desc">View and edit all pages</div>
          </button>

          <button class="action-card" on:click={goToBlog}>
            <div class="action-icon">📝</div>
            <div class="action-title">Manage Blog</div>
            <div class="action-desc">Create and edit blog posts</div>
          </button>
        </div>
      </div>

      <div class="info-box">
        <h3 class="info-title">🎉 Linebasis CMS Ready!</h3>
        <p class="info-description">
          Your professional design tool is ready to use. Start by creating pages in the designer
          or managing your blog content.
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .admin-page {
    min-height: 100vh;
    background-color: #f9fafb;
  }

  .page-header {
    background-color: white;
    padding: 2rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .header-left {
    max-width: 80rem;
    margin: 0 auto;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  .page-description {
    color: #6b7280;
    margin: 0.5rem 0 0 0;
  }

  .page-content {
    max-width: 80rem;
    margin: 0 auto;
    padding: 2rem;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    height: 100vh;
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

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    text-align: center;
  }

  .stat-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .quick-actions {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 1rem 0;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .action-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    width: 100%;
  }

  .action-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .action-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }

  .action-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.25rem;
  }

  .action-desc {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .info-box {
    background-color: #eff6ff;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #dbeafe;
  }

  .info-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e40af;
    margin: 0 0 0.5rem 0;
  }

  .info-description {
    color: #1e40af;
    margin: 0;
  }
</style>