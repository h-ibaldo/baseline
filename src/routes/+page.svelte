<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let isLoaded = false;

  onMount(() => {
    isLoaded = true;
  });

  function goToDesigner() {
    goto('/admin/designer');
  }

  function goToBlog() {
    goto('/admin/blog');
  }
</script>

<svelte:head>
  <title>Baseline - Professional Design Tool</title>
  <meta name="description" content="Professional design tool that combines Figma, WordPress, and Webflow into one powerful system" />
</svelte:head>

<div class="landing-page" class:loaded={isLoaded}>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title">
          <span class="title-line">Design</span>
          <span class="title-line">Publish</span>
          <span class="title-line highlight">Create</span>
        </h1>
        <p class="hero-description">
          The professional design tool that combines the best of Figma, WordPress, and Webflow. 
          Design, manage content, and publish websites all in one unified interface.
        </p>
        <div class="hero-actions">
          <button class="cta-button primary" on:click={goToDesigner}>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Open Designer
          </button>
          <button class="cta-button secondary" on:click={goToBlog}>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Manage Blog
          </button>
        </div>
      </div>
      <div class="hero-preview">
        <div class="preview-window">
          <div class="window-header">
            <div class="window-controls">
              <div class="control red"></div>
              <div class="control yellow"></div>
              <div class="control green"></div>
            </div>
            <div class="window-title">Baseline Designer</div>
          </div>
          <div class="preview-content">
            <div class="canvas-preview">
              <div class="artboard-preview">
                <div class="element-preview text">Welcome to Baseline</div>
                <div class="element-preview button">Get Started</div>
                <div class="element-preview image"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features">
    <div class="features-content">
      <h2 class="features-title">Everything you need to create amazing websites</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </div>
          <h3 class="feature-title">Unified Designer</h3>
          <p class="feature-description">
            Design like Figma, manage like WordPress. One interface for everything.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="feature-title">Component System</h3>
          <p class="feature-description">
            Create reusable components with style inheritance and global updates.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h3 class="feature-title">Instant Publishing</h3>
          <p class="feature-description">
            Publish pages instantly with Figma-style workflow and custom slugs.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="feature-title">Rich Content</h3>
          <p class="feature-description">
            Notion-like editor for blog posts with full formatting and media support.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </div>
          <h3 class="feature-title">Style Libraries</h3>
          <p class="feature-description">
            Manage design systems with colors, typography, and component styles.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="feature-title">Theme Export</h3>
          <p class="feature-description">
            Export themes as professional packages for easy sharing and deployment.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Quick Start Section -->
  <section class="quick-start">
    <div class="quick-start-content">
      <h2 class="quick-start-title">Ready to get started?</h2>
      <p class="quick-start-description">
        Jump into the designer and start creating amazing websites in minutes.
      </p>
      <div class="quick-start-actions">
        <button class="cta-button primary large" on:click={goToDesigner}>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Start Designing
        </button>
      </div>
    </div>
  </section>
</div>

<style>
  .landing-page {
    @apply min-h-screen bg-gradient-to-br from-gray-50 to-gray-100;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
  }

  .landing-page.loaded {
    @apply opacity-100;
    transform: translateY(0);
  }

  .hero {
    @apply py-20 px-4;
  }

  .hero-content {
    @apply max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center;
  }

  .hero-text {
    @apply space-y-8;
  }

  .hero-title {
    @apply text-5xl lg:text-6xl font-bold text-gray-900 leading-tight;
  }

  .title-line {
    @apply block;
  }

  .title-line.highlight {
    @apply text-blue-600;
  }

  .hero-description {
    @apply text-xl text-gray-600 leading-relaxed max-w-2xl;
  }

  .hero-actions {
    @apply flex flex-col sm:flex-row gap-4;
  }

  .cta-button {
    @apply inline-flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-200;
  }

  .cta-button.primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5;
  }

  .cta-button.secondary {
    @apply bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md;
  }

  .cta-button.large {
    @apply px-8 py-4 text-lg;
  }

  .hero-preview {
    @apply flex justify-center;
  }

  .preview-window {
    @apply bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-2xl;
  }

  .window-header {
    @apply bg-gray-100 px-4 py-3 flex items-center gap-3;
  }

  .window-controls {
    @apply flex gap-2;
  }

  .control {
    @apply w-3 h-3 rounded-full;
  }

  .control.red {
    @apply bg-red-500;
  }

  .control.yellow {
    @apply bg-yellow-500;
  }

  .control.green {
    @apply bg-green-500;
  }

  .window-title {
    @apply text-sm font-medium text-gray-600;
  }

  .preview-content {
    @apply p-8 bg-gray-50;
  }

  .canvas-preview {
    @apply bg-white rounded-lg shadow-sm p-8;
  }

  .artboard-preview {
    @apply relative bg-white border border-gray-200 rounded-lg p-8 min-h-64;
  }

  .element-preview {
    @apply absolute rounded-lg;
  }

  .element-preview.text {
    @apply top-8 left-8 text-2xl font-bold text-gray-900;
  }

  .element-preview.button {
    @apply top-16 left-8 bg-blue-600 text-white px-4 py-2 text-sm font-medium;
  }

  .element-preview.image {
    @apply top-8 right-8 w-16 h-16 bg-gray-200 rounded-lg;
  }

  .features {
    @apply py-20 px-4 bg-white;
  }

  .features-content {
    @apply max-w-6xl mx-auto;
  }

  .features-title {
    @apply text-4xl font-bold text-gray-900 text-center mb-16;
  }

  .features-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8;
  }

  .feature-card {
    @apply p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow;
  }

  .feature-icon {
    @apply w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4;
  }

  .feature-title {
    @apply text-xl font-semibold text-gray-900 mb-2;
  }

  .feature-description {
    @apply text-gray-600;
  }

  .quick-start {
    @apply py-20 px-4 bg-gray-900;
  }

  .quick-start-content {
    @apply max-w-4xl mx-auto text-center;
  }

  .quick-start-title {
    @apply text-4xl font-bold text-white mb-4;
  }

  .quick-start-description {
    @apply text-xl text-gray-300 mb-8;
  }

  .quick-start-actions {
    @apply flex justify-center;
  }
</style>