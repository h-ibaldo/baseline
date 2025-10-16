<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const blockId = $page.params.id;

	let formData = {
		name: '',
		description: '',
		category: 'custom',
		content: '',
		isPublic: false
	};

	let loading = true;
	let saving = false;
	let error = '';
	let jsonError = '';

	onMount(() => {
		loadBlock();
	});

	async function loadBlock() {
		const token = localStorage.getItem('access_token');
		if (!token) {
			goto('/admin/login');
			return;
		}

		try {
			const response = await fetch('/api/content-blocks', {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!response.ok) throw new Error('Failed to load blocks');

			const data = await response.json();
			const block = data.blocks.find((b: any) => b.id === blockId);

			if (!block) {
				error = 'Block not found';
				return;
			}

			formData = {
				name: block.name,
				description: block.description || '',
				category: block.category,
				content: JSON.stringify(JSON.parse(block.content), null, 2),
				isPublic: block.isPublic
			};
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load block';
		} finally {
			loading = false;
		}
	}

	function validateJSON() {
		try {
			JSON.parse(formData.content);
			jsonError = '';
			return true;
		} catch (err) {
			jsonError = 'Invalid JSON format';
			return false;
		}
	}

	async function handleSubmit() {
		error = '';

		if (!formData.name.trim()) {
			error = 'Block name is required';
			return;
		}

		if (!validateJSON()) {
			error = 'Block content must be valid JSON';
			return;
		}

		saving = true;

		try {
			const token = localStorage.getItem('access_token');
			const response = await fetch('/api/content-blocks', {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id: blockId, ...formData })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to update block');
			}

			goto('/admin/content-blocks');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update block';
		} finally {
			saving = false;
		}
	}

	function formatJSON() {
		try {
			const parsed = JSON.parse(formData.content);
			formData.content = JSON.stringify(parsed, null, 2);
			jsonError = '';
		} catch (err) {
			jsonError = 'Cannot format invalid JSON';
		}
	}
</script>

<svelte:head>
	<title>Edit Block - LineBasis Admin</title>
</svelte:head>

<div class="page">
	<header class="header">
		<div class="header-content">
			<div class="header-left">
				<a href="/admin/content-blocks" class="back-link">← Blocks</a>
				<h1>Edit Content Block</h1>
			</div>
		</div>
	</header>

	<div class="container">
		{#if error}
			<div class="error-banner">
				{error}
				<button on:click={() => (error = '')}>✕</button>
			</div>
		{/if}

		{#if loading}
			<div class="loading">Loading block...</div>
		{:else}
			<form on:submit|preventDefault={handleSubmit}>
				<div class="section">
					<h2>Basic Information</h2>

					<div class="form-group">
						<label for="name">Block Name *</label>
						<input id="name" type="text" bind:value={formData.name} required />
					</div>

					<div class="form-group">
						<label for="description">Description</label>
						<textarea id="description" bind:value={formData.description} rows="3"></textarea>
					</div>

					<div class="form-group">
						<label for="category">Category</label>
						<select id="category" bind:value={formData.category}>
							<option value="text">📝 Text</option>
							<option value="image">🖼️ Image</option>
							<option value="button">🔘 Button</option>
							<option value="card">🃏 Card</option>
							<option value="hero">🎯 Hero</option>
							<option value="custom">⚙️ Custom</option>
						</select>
					</div>

					<div class="form-group">
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={formData.isPublic} />
							<span>Make block public (shared with all users)</span>
						</label>
					</div>
				</div>

				<div class="section">
					<div class="section-header">
						<h2>Block Content (JSON)</h2>
						<button type="button" class="btn-secondary" on:click={formatJSON}>
							Format JSON
						</button>
					</div>

					<div class="form-group">
						<textarea
							class="json-editor"
							bind:value={formData.content}
							on:blur={validateJSON}
							rows="15"
							spellcheck="false"
						></textarea>
						{#if jsonError}
							<p class="field-error">{jsonError}</p>
						{:else}
							<p class="field-help">Define block structure as JSON</p>
						{/if}
					</div>
				</div>

				<div class="form-actions">
					<button type="button" class="btn-secondary" on:click={() => goto('/admin/content-blocks')}>
						Cancel
					</button>
					<button type="submit" class="btn-primary" disabled={saving}>
						{saving ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
		background: #f7fafc;
	}

	.header {
		background: white;
		border-bottom: 1px solid #e2e8f0;
		padding: 20px 0;
	}

	.header-content {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.back-link {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
	}

	h1 {
		margin: 0;
		font-size: 24px;
		color: #1a202c;
	}

	.container {
		max-width: 900px;
		margin: 24px auto;
		padding: 0 24px;
	}

	.error-banner {
		background: #fed7d7;
		color: #c53030;
		padding: 12px 24px;
		border-radius: 6px;
		display: flex;
		justify-content: space-between;
		margin-bottom: 24px;
	}

	.loading {
		text-align: center;
		padding: 40px;
		color: #718096;
	}

	.section {
		background: white;
		padding: 24px;
		border-radius: 8px;
		margin-bottom: 24px;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	h2 {
		margin: 0 0 16px 0;
		font-size: 18px;
		color: #1a202c;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #1a202c;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 10px 12px;
		border: 2px solid #e2e8f0;
		border-radius: 6px;
		font-size: 14px;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #667eea;
	}

	.json-editor {
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 13px;
		line-height: 1.6;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.checkbox-label input {
		width: auto;
	}

	.field-help {
		margin: 6px 0 0 0;
		font-size: 13px;
		color: #718096;
	}

	.field-error {
		margin: 6px 0 0 0;
		font-size: 13px;
		color: #e53e3e;
	}

	.form-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.btn-primary,
	.btn-secondary {
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-primary {
		background: #667eea;
		color: white;
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
	}
</style>
