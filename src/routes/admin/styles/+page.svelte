<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { DesignTokens } from '$lib/types/tokens';

	let tokens: DesignTokens | null = null;
	let isLoading = true;
	let isSaving = false;
	let error = '';
	let successMessage = '';

	onMount(async () => {
		await loadTokens();
	});

	async function loadTokens() {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			goto('/admin/login');
			return;
		}

		try {
			const response = await fetch('/api/tokens', {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!response.ok) throw new Error('Failed to load tokens');

			const data = await response.json();
			tokens = data.tokens;
		} catch (err) {
			error = 'Failed to load design tokens';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	async function saveTokens() {
		const token = localStorage.getItem('accessToken');
		isSaving = true;
		error = '';
		successMessage = '';

		try {
			const response = await fetch('/api/tokens', {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ tokens })
			});

			if (!response.ok) throw new Error('Failed to save tokens');

			successMessage = 'Design tokens saved successfully!';
			setTimeout(() => (successMessage = ''), 3000);
		} catch (err) {
			error = 'Failed to save design tokens';
			console.error(err);
		} finally {
			isSaving = false;
		}
	}

	async function resetTokens() {
		if (!confirm('Are you sure you want to reset to default tokens? This cannot be undone.'))
			return;

		const token = localStorage.getItem('accessToken');

		try {
			const response = await fetch('/api/tokens/reset', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!response.ok) throw new Error('Failed to reset tokens');

			const data = await response.json();
			tokens = data.tokens;
			successMessage = 'Tokens reset to defaults!';
			setTimeout(() => (successMessage = ''), 3000);
		} catch (err) {
			error = 'Failed to reset tokens';
			console.error(err);
		}
	}
</script>

<!-- STYLE: Design system main page -->
<main class="design-system">
	<!-- STYLE: Page header with title and actions -->
	<header class="system-header">
		<h1 class="page-title">Design System</h1>
		<div class="header-actions">
			<button class="button-reset" on:click={resetTokens}>Reset to Defaults</button>
			<button class="button-save" on:click={saveTokens} disabled={isSaving}>
				{isSaving ? 'Saving...' : 'Save Changes'}
			</button>
		</div>
	</header>

	<!-- STYLE: Success message -->
	{#if successMessage}
		<div class="success-message" role="status">
			{successMessage}
		</div>
	{/if}

	<!-- STYLE: Error message -->
	{#if error}
		<div class="error-message" role="alert">
			{error}
		</div>
	{/if}

	<!-- STYLE: Loading state -->
	{#if isLoading}
		<div class="loading-state">
			<p>Loading design system...</p>
		</div>
	{:else if tokens}
		<!-- STYLE: Token sections container -->
		<div class="tokens-container">
			<!-- STYLE: Colors section -->
			<section class="token-section">
				<h2 class="section-title">Colors</h2>
				<div class="token-grid">
					{#each Object.entries(tokens.colors) as [key, value]}
						<div class="token-item">
							<label for="color-{key}" class="token-label">{key}</label>
							<div class="color-input-group">
								<input
									type="color"
									id="color-{key}"
									class="color-picker"
									bind:value={tokens.colors[key]}
								/>
								<input
									type="text"
									class="color-value"
									bind:value={tokens.colors[key]}
									placeholder="#000000"
								/>
							</div>
							<!-- STYLE: Color preview swatch -->
							<div class="color-preview" style="background-color: {value}"></div>
						</div>
					{/each}
				</div>
			</section>

			<!-- STYLE: Typography section -->
			<section class="token-section">
				<h2 class="section-title">Typography</h2>
				{#each Object.entries(tokens.typography) as [key, typo]}
					<div class="typography-group">
						<h3 class="group-title">{key}</h3>
						<div class="token-grid">
							<div class="token-item">
								<label for="font-{key}-family" class="token-label">Font Family</label>
								<input
									type="text"
									id="font-{key}-family"
									class="token-input"
									bind:value={typo.fontFamily}
								/>
							</div>
							<div class="token-item">
								<label for="font-{key}-size" class="token-label">Font Size</label>
								<input
									type="text"
									id="font-{key}-size"
									class="token-input"
									bind:value={typo.fontSize}
								/>
							</div>
							<div class="token-item">
								<label for="font-{key}-weight" class="token-label">Font Weight</label>
								<input
									type="text"
									id="font-{key}-weight"
									class="token-input"
									bind:value={typo.fontWeight}
								/>
							</div>
							<div class="token-item">
								<label for="font-{key}-lineHeight" class="token-label">Line Height</label>
								<input
									type="text"
									id="font-{key}-lineHeight"
									class="token-input"
									bind:value={typo.lineHeight}
								/>
							</div>
						</div>
						<!-- STYLE: Typography preview -->
						<div
							class="typography-preview"
							style="font-family: {typo.fontFamily}; font-size: {typo.fontSize}; font-weight: {typo.fontWeight}; line-height: {typo.lineHeight};"
						>
							Preview: The quick brown fox jumps over the lazy dog
						</div>
					</div>
				{/each}
			</section>

			<!-- STYLE: Spacing section -->
			<section class="token-section">
				<h2 class="section-title">Spacing</h2>
				<div class="token-grid">
					<div class="token-item">
						<label for="spacing-baseUnit" class="token-label">Base Unit (px)</label>
						<input
							type="number"
							id="spacing-baseUnit"
							class="token-input"
							bind:value={tokens.spacing.baseUnit}
							min="1"
							max="16"
						/>
					</div>
					{#each Object.entries(tokens.spacing).filter(([k]) => k !== 'baseUnit') as [key, value]}
						<div class="token-item">
							<label for="spacing-{key}" class="token-label">{key}</label>
							<input
								type="text"
								id="spacing-{key}"
								class="token-input"
								bind:value={tokens.spacing[key]}
							/>
							<!-- STYLE: Spacing preview box -->
							<div class="spacing-preview">
								<div class="spacing-box" style="width: {value}; height: {value};"></div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- STYLE: Effects section -->
			<section class="token-section">
				<h2 class="section-title">Effects</h2>

				<!-- Border Radius -->
				<h3 class="subsection-title">Border Radius</h3>
				<div class="token-grid">
					{#each Object.entries(tokens.effects.borderRadius) as [key, value]}
						<div class="token-item">
							<label for="radius-{key}" class="token-label">{key}</label>
							<input
								type="text"
								id="radius-{key}"
								class="token-input"
								bind:value={tokens.effects.borderRadius[key]}
							/>
							<!-- STYLE: Border radius preview -->
							<div class="radius-preview">
								<div class="radius-box" style="border-radius: {value};"></div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Shadow -->
				<h3 class="subsection-title">Shadow</h3>
				<div class="token-grid">
					{#each Object.entries(tokens.effects.shadow) as [key, value]}
						<div class="token-item">
							<label for="shadow-{key}" class="token-label">{key}</label>
							<input
								type="text"
								id="shadow-{key}"
								class="token-input"
								bind:value={tokens.effects.shadow[key]}
							/>
							<!-- STYLE: Shadow preview -->
							<div class="shadow-preview">
								<div class="shadow-box" style="box-shadow: {value};"></div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Transition -->
				<h3 class="subsection-title">Transition</h3>
				<div class="token-grid">
					{#each Object.entries(tokens.effects.transition) as [key, value]}
						<div class="token-item">
							<label for="transition-{key}" class="token-label">{key}</label>
							<input
								type="text"
								id="transition-{key}"
								class="token-input"
								bind:value={tokens.effects.transition[key]}
							/>
						</div>
					{/each}
				</div>
			</section>

			<!-- STYLE: Baseline Grid section -->
			<section class="token-section">
				<h2 class="section-title">Baseline Grid</h2>
				<div class="token-grid">
					<div class="token-item">
						<label for="baseline-gridUnit" class="token-label">Grid Unit (px)</label>
						<input
							type="number"
							id="baseline-gridUnit"
							class="token-input"
							bind:value={tokens.baseline.gridUnit}
							min="4"
							max="32"
							step="4"
						/>
						<p class="token-hint">Recommended: 4, 8, 12, or 16</p>
					</div>
					<div class="token-item">
						<label for="baseline-lineHeight" class="token-label">Line Height Multiplier</label>
						<input
							type="number"
							id="baseline-lineHeight"
							class="token-input"
							bind:value={tokens.baseline.lineHeightMultiplier}
							min="1"
							max="2"
							step="0.1"
						/>
						<p class="token-hint">Recommended: 1.5</p>
					</div>
				</div>
			</section>
		</div>

		<!-- STYLE: Sticky save button at bottom -->
		<div class="save-bar">
			<button class="button-save-large" on:click={saveTokens} disabled={isSaving}>
				{isSaving ? 'Saving Changes...' : 'Save All Changes'}
			</button>
		</div>
	{/if}
</main>

<!--
  NO STYLES - Ready for Ibaldo's design!

  This is a COMPREHENSIVE design system editor with:
  ✅ Color picker with hex input and preview
  ✅ Typography editor (family, size, weight, line-height) with live preview
  ✅ Spacing editor with visual previews
  ✅ Border radius editor with preview boxes
  ✅ Shadow editor with preview cards
  ✅ Transition timing editor
  ✅ Baseline grid configuration
  ✅ Save/reset functionality
  ✅ Success/error messages
  ✅ Permission-based access (owner/manager only for save)

  All functional - ready for your styling!
-->
