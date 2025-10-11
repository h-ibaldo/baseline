<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface Plugin {
		id: string;
		name: string;
		version: string;
		description: string;
		author: string;
		capabilities: string[];
		isInstalled: boolean;
		isActive: boolean;
		installedAt: string | null;
		settings: Record<string, any>;
		isLoaded: boolean;
	}

	interface PluginStats {
		total: number;
		active: number;
		inactive: number;
	}

	let plugins: Plugin[] = [];
	let stats: PluginStats = { total: 0, active: 0, inactive: 0 };
	let loading = true;
	let error = '';
	let filterStatus: 'all' | 'active' | 'inactive' = 'all';

	onMount(() => {
		loadPlugins();
	});

	async function loadPlugins() {
		try {
			loading = true;
			error = '';

			const token = localStorage.getItem('access_token');
			if (!token) {
				goto('/admin/login');
				return;
			}

			const response = await fetch('/api/plugins', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.status === 401) {
				goto('/admin/login');
				return;
			}

			if (!response.ok) {
				throw new Error('Failed to load plugins');
			}

			const data = await response.json();
			plugins = data.plugins || [];
			stats = data.stats || { total: 0, active: 0, inactive: 0 };
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load plugins';
		} finally {
			loading = false;
		}
	}

	async function togglePlugin(plugin: Plugin) {
		try {
			const token = localStorage.getItem('access_token');
			const action = plugin.isActive ? 'deactivate' : 'activate';

			const response = await fetch(`/api/plugins/${plugin.id}/${action}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || `Failed to ${action} plugin`);
			}

			await loadPlugins();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to toggle plugin';
		}
	}

	$: filteredPlugins = plugins.filter((p) => {
		if (filterStatus === 'active') return p.isActive;
		if (filterStatus === 'inactive') return !p.isActive;
		return true;
	});

	function getStatusClass(plugin: Plugin): string {
		if (!plugin.isInstalled) return 'status-not-installed';
		if (plugin.isActive) return 'status-active';
		return 'status-inactive';
	}

	function getStatusLabel(plugin: Plugin): string {
		if (!plugin.isInstalled) return 'Not Installed';
		if (plugin.isActive) return 'Active';
		return 'Inactive';
	}
</script>

<div class="plugins-page">
	<header class="page-header">
		<div class="header-content">
			<h1>Plugins</h1>
			<p class="subtitle">Manage LineBasis plugins</p>
		</div>
	</header>

	{#if error}
		<div class="error-banner">
			<span>⚠️ {error}</span>
			<button on:click={() => (error = '')}>✕</button>
		</div>
	{/if}

	<!-- Stats Cards -->
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-icon">🔌</div>
			<div class="stat-value">{stats.total}</div>
			<div class="stat-label">Total Plugins</div>
		</div>

		<div class="stat-card active">
			<div class="stat-icon">✅</div>
			<div class="stat-value">{stats.active}</div>
			<div class="stat-label">Active Plugins</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">💤</div>
			<div class="stat-value">{stats.inactive}</div>
			<div class="stat-label">Inactive Plugins</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="filters">
		<div class="filter-buttons">
			<button
				class="filter-btn"
				class:active={filterStatus === 'all'}
				on:click={() => (filterStatus = 'all')}
			>
				All Plugins
			</button>
			<button
				class="filter-btn"
				class:active={filterStatus === 'active'}
				on:click={() => (filterStatus = 'active')}
			>
				Active
			</button>
			<button
				class="filter-btn"
				class:active={filterStatus === 'inactive'}
				on:click={() => (filterStatus = 'inactive')}
			>
				Inactive
			</button>
		</div>
	</div>

	{#if loading}
		<div class="loading">Loading plugins...</div>
	{:else if filteredPlugins.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🔌</div>
			<h3>No plugins found</h3>
			<p>
				{filterStatus !== 'all'
					? `No ${filterStatus} plugins`
					: 'No plugins installed yet'}
			</p>
		</div>
	{:else}
		<div class="plugins-grid">
			{#each filteredPlugins as plugin (plugin.id)}
				<div class="plugin-card">
					<div class="plugin-header">
						<div>
							<h3 class="plugin-name">{plugin.name}</h3>
							<p class="plugin-id">{plugin.id}</p>
						</div>
						<span class="plugin-status {getStatusClass(plugin)}">
							{getStatusLabel(plugin)}
						</span>
					</div>

					<p class="plugin-description">{plugin.description}</p>

					<div class="plugin-meta">
						<div class="meta-item">
							<span class="meta-label">Version:</span>
							<span class="meta-value">{plugin.version}</span>
						</div>
						<div class="meta-item">
							<span class="meta-label">Author:</span>
							<span class="meta-value">{plugin.author}</span>
						</div>
						{#if plugin.installedAt}
							<div class="meta-item">
								<span class="meta-label">Installed:</span>
								<span class="meta-value">
									{new Date(plugin.installedAt).toLocaleDateString()}
								</span>
							</div>
						{/if}
					</div>

					{#if plugin.capabilities.length > 0}
						<div class="plugin-capabilities">
							{#each plugin.capabilities as capability}
								<span class="capability-badge">{capability}</span>
							{/each}
						</div>
					{/if}

					<div class="plugin-actions">
						{#if plugin.isInstalled}
							<button
								class="btn-toggle"
								class:active={plugin.isActive}
								on:click={() => togglePlugin(plugin)}
							>
								{plugin.isActive ? 'Deactivate' : 'Activate'}
							</button>
							{#if plugin.isActive}
								<button class="btn-secondary" disabled>Settings</button>
							{/if}
						{:else}
							<button class="btn-primary" disabled>Install</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.plugins-page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		margin: 0;
		font-size: 2rem;
		color: var(--color-text);
	}

	.subtitle {
		margin: 0.5rem 0 0 0;
		color: var(--color-text-muted);
	}

	.error-banner {
		background: #fee;
		border: 1px solid #fcc;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: #c00;
	}

	.error-banner button {
		background: none;
		border: none;
		color: #c00;
		cursor: pointer;
		font-size: 1.2rem;
		padding: 0 0.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.stat-card.active {
		background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
	}

	.stat-icon {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.filters {
		margin-bottom: 2rem;
	}

	.filter-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.filter-btn {
		padding: 0.75rem 1.5rem;
		background: white;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.95rem;
		transition: all 0.2s;
	}

	.filter-btn:hover {
		background: var(--color-bg-secondary);
	}

	.filter-btn.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.loading,
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-text-muted);
	}

	.empty-state {
		background: var(--color-bg-secondary);
		border-radius: 12px;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		margin: 0 0 0.5rem 0;
		color: var(--color-text);
	}

	.empty-state p {
		margin: 0;
	}

	.plugins-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.plugin-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.plugin-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.plugin-name {
		margin: 0;
		font-size: 1.25rem;
		color: var(--color-text);
	}

	.plugin-id {
		margin: 0.25rem 0 0 0;
		font-size: 0.85rem;
		color: var(--color-text-muted);
		font-family: monospace;
	}

	.plugin-status {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.status-active {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.status-inactive {
		background: #f5f5f5;
		color: #616161;
	}

	.status-not-installed {
		background: #fff3e0;
		color: #e65100;
	}

	.plugin-description {
		margin: 0;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.plugin-meta {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.meta-item {
		display: flex;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.meta-label {
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.meta-value {
		color: var(--color-text);
	}

	.plugin-capabilities {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.capability-badge {
		padding: 0.25rem 0.5rem;
		background: #e3f2fd;
		color: #1565c0;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.plugin-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border);
	}

	.btn-toggle {
		flex: 1;
		padding: 0.75rem 1.5rem;
		background: white;
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-toggle:hover {
		background: var(--color-bg-secondary);
	}

	.btn-toggle.active {
		background: #d32f2f;
		color: white;
		border-color: #d32f2f;
	}

	.btn-toggle.active:hover {
		background: #c62828;
	}

	.btn-primary {
		flex: 1;
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		padding: 0.75rem 1rem;
		background: white;
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.95rem;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: var(--color-bg-secondary);
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
