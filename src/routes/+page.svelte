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
  <title>Linebasis - Professional Design Tool</title>
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
            <div class="window-title">Linebasis Designer</div>
          </div>
          <div class="preview-content">
            <div class="canvas-preview">
              <div class="artboard-preview">
                <div class="element-preview text">Welcome to Linebasis</div>
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
    min-height: 100vh;
    background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
  }

  .landing-page.loaded {
    opacity: 1;
    transform: translateY(0);
  }

  .hero {
    padding: 5rem 1rem;
  }

  .hero-content {
    max-width: 80rem;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    align-items: center;
  }

  @media (min-width: 1024px) {
    .hero-content {
      grid-template-columns: 1fr 1fr;
    }
  }

  .hero-text {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .hero-title {
    font-size: 3rem;
    font-weight: 700;
    color: #111827;
    line-height: 1.1;
  }

  @media (min-width: 1024px) {
    .hero-title {
      font-size: 3.75rem;
    }
  }

  .title-line {
    display: block;
  }

  .title-line.highlight {
    color: #2563eb;
  }

  .hero-description {
    font-size: 1.25rem;
    color: #6b7280;
    line-height: 1.6;
    max-width: 42rem;
  }

  .hero-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .hero-actions {
      flex-direction: row;
    }
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.2s;
    text-decoration: none;
    border: none;
    cursor: pointer;
  }

  .cta-button.primary {
    background-color: #2563eb;
    color: white;
  }

  .cta-button.primary:hover {
    background-color: #1d4ed8;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .cta-button.secondary {
    background-color: white;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .cta-button.secondary:hover {
    background-color: #f9fafb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .cta-button.large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }

  .hero-preview {
    display: flex;
    justify-content: center;
  }

  .preview-window {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    width: 100%;
    max-width: 42rem;
  }

  .window-header {
    background-color: #f3f4f6;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .window-controls {
    display: flex;
    gap: 0.5rem;
  }

  .control {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
  }

  .control.red {
    background-color: #ef4444;
  }

  .control.yellow {
    background-color: #eab308;
  }

  .control.green {
    background-color: #22c55e;
  }

  .window-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
  }

  .preview-content {
    padding: 2rem;
    background-color: #f9fafb;
  }

  .canvas-preview {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }

  .artboard-preview {
    position: relative;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 2rem;
    min-height: 16rem;
  }

  .element-preview {
    position: absolute;
    border-radius: 0.5rem;
  }

  .element-preview.text {
    top: 2rem;
    left: 2rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }

  .element-preview.button {
    top: 4rem;
    left: 2rem;
    background-color: #2563eb;
    color: white;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .element-preview.image {
    top: 2rem;
    right: 2rem;
    width: 4rem;
    height: 4rem;
    background-color: #e5e7eb;
    border-radius: 0.5rem;
  }

  .features {
    padding: 5rem 1rem;
    background-color: white;
  }

  .features-content {
    max-width: 72rem;
    margin: 0 auto;
  }

  .features-title {
    font-size: 2.25rem;
    font-weight: 700;
    color: #111827;
    text-align: center;
    margin-bottom: 4rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (min-width: 768px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .features-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .feature-card {
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    transition: box-shadow 0.2s;
  }

  .feature-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .feature-icon {
    width: 3rem;
    height: 3rem;
    background-color: #dbeafe;
    color: #2563eb;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .feature-description {
    color: #6b7280;
  }

  .quick-start {
    padding: 5rem 1rem;
    background-color: #111827;
  }

  .quick-start-content {
    max-width: 56rem;
    margin: 0 auto;
    text-align: center;
  }

  .quick-start-title {
    font-size: 2.25rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1rem;
  }

  .quick-start-description {
    font-size: 1.25rem;
    color: #d1d5db;
    margin-bottom: 2rem;
  }

  .quick-start-actions {
    display: flex;
    justify-content: center;
  }
</style>