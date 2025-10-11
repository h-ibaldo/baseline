<script lang="ts">
	/**
	 * SEO Metadata Editor Component
	 *
	 * Reusable component for editing page SEO metadata
	 */

	export let metaTitle: string = '';
	export let metaDescription: string = '';
	export let metaImage: string = '';
	export let pageTitle: string = ''; // Use page title as fallback
	export let pageDescription: string = ''; // Use page description as fallback

	let expanded = false;

	// Character count helpers
	$: titleLength = metaTitle.length || pageTitle.length;
	$: descriptionLength = metaDescription.length || pageDescription.length;

	// Optimal lengths for SEO
	const TITLE_OPTIMAL = 60;
	const TITLE_MAX = 70;
	const DESCRIPTION_OPTIMAL = 160;
	const DESCRIPTION_MAX = 200;

	function getCharCountClass(current: number, optimal: number, max: number): string {
		if (current === 0) return 'count-default';
		if (current <= optimal) return 'count-good';
		if (current <= max) return 'count-warning';
		return 'count-error';
	}

	function toggleExpanded() {
		expanded = !expanded;
	}
</script>

<div class="seo-editor">
	<button type="button" class="seo-header" on:click={toggleExpanded}>
		<div class="header-content">
			<span class="header-icon">🔍</span>
			<div>
				<h3>SEO Metadata</h3>
				<p class="header-desc">
					{expanded ? 'Configure how this page appears in search results' : 'Click to edit SEO settings'}
				</p>
			</div>
		</div>
		<span class="expand-icon">{expanded ? '▼' : '▶'}</span>
	</button>

	{#if expanded}
		<div class="seo-content">
			<!-- Meta Title -->
			<div class="form-group">
				<label for="metaTitle">
					Meta Title
					<span class="optional">(optional)</span>
				</label>
				<input
					id="metaTitle"
					type="text"
					bind:value={metaTitle}
					placeholder={pageTitle || 'Custom title for search engines'}
					maxlength="70"
				/>
				<div class="field-info">
					<span class="char-count {getCharCountClass(titleLength, TITLE_OPTIMAL, TITLE_MAX)}">
						{titleLength}/{TITLE_MAX} characters
						{#if titleLength > TITLE_MAX}
							<span class="warning">⚠️ Too long</span>
						{:else if titleLength > TITLE_OPTIMAL && titleLength <= TITLE_MAX}
							<span class="info">ℹ️ Consider shortening</span>
						{/if}
					</span>
				</div>
				<p class="field-help">
					{#if metaTitle}
						Using custom meta title
					{:else}
						Using page title: "{pageTitle || 'Untitled'}"
					{/if}
				</p>
			</div>

			<!-- Meta Description -->
			<div class="form-group">
				<label for="metaDescription">
					Meta Description
					<span class="optional">(optional)</span>
				</label>
				<textarea
					id="metaDescription"
					bind:value={metaDescription}
					placeholder={pageDescription || 'Custom description for search engines'}
					rows="3"
					maxlength="200"
				></textarea>
				<div class="field-info">
					<span class="char-count {getCharCountClass(descriptionLength, DESCRIPTION_OPTIMAL, DESCRIPTION_MAX)}">
						{descriptionLength}/{DESCRIPTION_MAX} characters
						{#if descriptionLength > DESCRIPTION_MAX}
							<span class="warning">⚠️ Too long</span>
						{:else if descriptionLength > DESCRIPTION_OPTIMAL && descriptionLength <= DESCRIPTION_MAX}
							<span class="info">ℹ️ Consider shortening</span>
						{/if}
					</span>
				</div>
				<p class="field-help">
					{#if metaDescription}
						Using custom meta description
					{:else}
						{pageDescription ? `Using page description` : 'No description set'}
					{/if}
				</p>
			</div>

			<!-- Meta Image (OG Image) -->
			<div class="form-group">
				<label for="metaImage">
					Social Media Image (OG Image)
					<span class="optional">(optional)</span>
				</label>
				<div class="image-input-group">
					<input
						id="metaImage"
						type="url"
						bind:value={metaImage}
						placeholder="https://example.com/image.jpg"
					/>
					<button type="button" class="btn-browse">Browse Media</button>
				</div>
				{#if metaImage}
					<div class="image-preview">
						<img src={metaImage} alt="Meta preview" />
						<button type="button" class="btn-remove" on:click={() => (metaImage = '')}>✕</button>
					</div>
				{/if}
				<p class="field-help">
					Recommended size: 1200x630px. Used when sharing on social media.
				</p>
			</div>

			<!-- Preview -->
			<div class="preview-section">
				<h4>Search Engine Preview</h4>
				<div class="search-preview">
					<div class="preview-url">https://example.com/{pageTitle?.toLowerCase().replace(/\s+/g, '-') || 'page'}</div>
					<div class="preview-title">{metaTitle || pageTitle || 'Untitled Page'}</div>
					<div class="preview-description">
						{metaDescription || pageDescription || 'No description available'}
					</div>
				</div>
			</div>

			<!-- Social Media Preview -->
			{#if metaImage}
				<div class="preview-section">
					<h4>Social Media Preview</h4>
					<div class="social-preview">
						<div class="social-image">
							<img src={metaImage} alt="Social preview" />
						</div>
						<div class="social-content">
							<div class="social-title">{metaTitle || pageTitle || 'Untitled Page'}</div>
							<div class="social-description">
								{metaDescription || pageDescription || 'No description available'}
							</div>
							<div class="social-url">example.com</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.seo-editor {
		border: 1px solid var(--color-border);
		border-radius: 8px;
		overflow: hidden;
	}

	.seo-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		background: white;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
	}

	.seo-header:hover {
		background: var(--color-bg-secondary);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		text-align: left;
	}

	.header-icon {
		font-size: 1.5rem;
	}

	.seo-header h3 {
		margin: 0;
		font-size: 1rem;
		color: var(--color-text);
	}

	.header-desc {
		margin: 0.25rem 0 0 0;
		font-size: 0.85rem;
		color: var(--color-text-muted);
		font-weight: normal;
	}

	.expand-icon {
		color: var(--color-text-muted);
		font-size: 0.8rem;
	}

	.seo-content {
		padding: 1.5rem;
		background: var(--color-bg-secondary);
		border-top: 1px solid var(--color-border);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.optional {
		font-weight: normal;
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 0.95rem;
		font-family: inherit;
		background: white;
	}

	.form-group textarea {
		resize: vertical;
	}

	.field-info {
		margin-top: 0.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.char-count {
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.count-default {
		color: var(--color-text-muted);
	}

	.count-good {
		color: #2e7d32;
	}

	.count-warning {
		color: #f57c00;
	}

	.count-error {
		color: #d32f2f;
	}

	.warning,
	.info {
		font-size: 0.8rem;
	}

	.field-help {
		margin: 0.5rem 0 0 0;
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.image-input-group {
		display: flex;
		gap: 0.5rem;
	}

	.image-input-group input {
		flex: 1;
	}

	.btn-browse {
		padding: 0.75rem 1rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.btn-browse:hover {
		background: var(--color-bg-secondary);
	}

	.image-preview {
		margin-top: 1rem;
		position: relative;
		display: inline-block;
	}

	.image-preview img {
		max-width: 200px;
		max-height: 120px;
		border-radius: 6px;
		border: 1px solid var(--color-border);
	}

	.btn-remove {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #d32f2f;
		color: white;
		border: none;
		cursor: pointer;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.btn-remove:hover {
		background: #c62828;
		transform: scale(1.1);
	}

	.preview-section {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-border);
	}

	.preview-section h4 {
		margin: 0 0 1rem 0;
		font-size: 0.9rem;
		color: var(--color-text);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.search-preview {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 1rem;
	}

	.preview-url {
		font-size: 0.85rem;
		color: #1a0dab;
		margin-bottom: 0.25rem;
	}

	.preview-title {
		font-size: 1.1rem;
		color: #1a0dab;
		font-weight: 400;
		margin-bottom: 0.25rem;
	}

	.preview-description {
		font-size: 0.85rem;
		color: #4d5156;
		line-height: 1.4;
	}

	.social-preview {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		overflow: hidden;
	}

	.social-image {
		width: 100%;
		aspect-ratio: 1.91 / 1;
		overflow: hidden;
		background: var(--color-bg-secondary);
	}

	.social-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.social-content {
		padding: 1rem;
		border-top: 1px solid var(--color-border);
	}

	.social-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.25rem;
	}

	.social-description {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
	}

	.social-url {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}
</style>
