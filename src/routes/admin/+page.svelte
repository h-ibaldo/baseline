<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any = null;
	let stats = {
		pages: 0,
		media: 0,
		storage: 0
	};
	let loading = true;

	onMount(async () => {
		// Check if user is logged in
		const token = localStorage.getItem('access_token');
		if (!token) {
			goto('/admin/login');
			return;
		}

		try {
			// Fetch user info
			const userResponse = await fetch('/api/auth/me', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!userResponse.ok) {
				throw new Error('Not authenticated');
			}

			user = await userResponse.json();

			// Fetch stats
			await loadStats();
		} catch (error) {
			localStorage.removeItem('access_token');
			localStorage.removeItem('user');
			goto('/admin/login');
		} finally {
			loading = false;
		}
	});

	async function loadStats() {
		const token = localStorage.getItem('access_token');

		try {
			// Get pages count
			const pagesResponse = await fetch('/api/pages', {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (pagesResponse.ok) {
				const pagesData = await pagesResponse.json();
				stats.pages = pagesData.total || 0;
			}

			// Get media stats
			const mediaResponse = await fetch('/api/media/stats', {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (mediaResponse.ok) {
				const mediaData = await mediaResponse.json();
				stats.media = mediaData.totalFiles || 0;
				stats.storage = mediaData.totalSize || 0;
			}
		} catch (error) {
			console.error('Failed to load stats:', error);
		}
	}

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	}

	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
		} catch (error) {
			console.error('Logout error:', error);
		}

		localStorage.removeItem('access_token');
		localStorage.removeItem('user');
		goto('/admin/login');
	}
</script>

<svelte:head>
	<title>Admin Dashboard - LineBasis</title>
</svelte:head>

{#if loading}
	<div class="loading">Loading...</div>
{:else if user}
	<div class="admin-container">
		<header class="header">
			<div class="header-content">
				<h1>LineBasis Admin</h1>
				<div class="user-info">
					<span class="user-name">{user.name}</span>
					<span class="user-role">{user.role}</span>
					<button class="btn-logout" on:click={handleLogout}>Logout</button>
				</div>
			</div>
		</header>

		<nav class="nav">
			<a href="/admin" class="nav-link active">Dashboard</a>
			<a href="/admin/pages" class="nav-link">Pages</a>
			<a href="/admin/media" class="nav-link">Media</a>
			<a href="/admin/users" class="nav-link">Users</a>
			<a href="/admin/plugins" class="nav-link">Plugins</a>
			<a href="/admin/settings" class="nav-link">Settings</a>
			<a href="/" class="nav-link">Designer</a>
		</nav>

		<main class="main">
			<h2>Welcome back, {user.name}!</h2>

			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon">📄</div>
					<div class="stat-value">{stats.pages}</div>
					<div class="stat-label">Total Pages</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">🖼️</div>
					<div class="stat-value">{stats.media}</div>
					<div class="stat-label">Media Files</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">💾</div>
					<div class="stat-value">{formatBytes(stats.storage)}</div>
					<div class="stat-label">Storage Used</div>
				</div>
			</div>

			<div class="quick-actions">
				<h3>Quick Actions</h3>
				<div class="action-grid">
					<a href="/" class="action-card">
						<div class="action-icon">✨</div>
						<div class="action-title">Create Page</div>
						<div class="action-desc">Design a new page in LineBasis</div>
					</a>

					<a href="/admin/media" class="action-card">
						<div class="action-icon">📤</div>
						<div class="action-title">Upload Media</div>
						<div class="action-desc">Add images and files</div>
					</a>

					<a href="/admin/pages" class="action-card">
						<div class="action-icon">📋</div>
						<div class="action-title">Manage Pages</div>
						<div class="action-desc">View and edit all pages</div>
					</a>
				</div>
			</div>

			<div class="info-box">
				<h3>🎉 Phase 1.5 Complete!</h3>
				<p>
					LineBasis CMS is now functional! You can authenticate, upload media, and manage pages.
					Check out the <a href="/">Designer</a> to create beautiful pages with the baseline grid
					system.
				</p>
			</div>
		</main>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			sans-serif;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		font-size: 18px;
		color: #718096;
	}

	.admin-container {
		min-height: 100vh;
		background: #f7fafc;
	}

	.header {
		background: white;
		border-bottom: 1px solid #e2e8f0;
		padding: 20px 0;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header h1 {
		margin: 0;
		font-size: 24px;
		font-weight: 700;
		color: #1a202c;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.user-name {
		font-weight: 500;
		color: #2d3748;
	}

	.user-role {
		background: #667eea;
		color: white;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.btn-logout {
		padding: 8px 16px;
		background: #e2e8f0;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-logout:hover {
		background: #cbd5e0;
	}

	.nav {
		background: white;
		border-bottom: 1px solid #e2e8f0;
		padding: 0 24px;
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		gap: 8px;
	}

	.nav-link {
		padding: 12px 20px;
		text-decoration: none;
		color: #4a5568;
		font-weight: 500;
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
	}

	.nav-link:hover {
		color: #667eea;
	}

	.nav-link.active {
		color: #667eea;
		border-bottom-color: #667eea;
	}

	.main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 40px 24px;
	}

	.main h2 {
		margin: 0 0 32px 0;
		font-size: 32px;
		color: #1a202c;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 24px;
		margin-bottom: 48px;
	}

	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.stat-icon {
		font-size: 48px;
		margin-bottom: 12px;
	}

	.stat-value {
		font-size: 36px;
		font-weight: 700;
		color: #1a202c;
		margin-bottom: 8px;
	}

	.stat-label {
		font-size: 14px;
		color: #718096;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.quick-actions h3 {
		margin: 0 0 20px 0;
		font-size: 20px;
		color: #1a202c;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 20px;
		margin-bottom: 48px;
	}

	.action-card {
		background: white;
		border-radius: 12px;
		padding: 24px;
		text-decoration: none;
		transition: all 0.2s;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.action-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.action-icon {
		font-size: 32px;
		margin-bottom: 12px;
	}

	.action-title {
		font-size: 18px;
		font-weight: 600;
		color: #1a202c;
		margin-bottom: 8px;
	}

	.action-desc {
		font-size: 14px;
		color: #718096;
	}

	.info-box {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 12px;
		padding: 32px;
	}

	.info-box h3 {
		margin: 0 0 16px 0;
		font-size: 24px;
	}

	.info-box p {
		margin: 0;
		font-size: 16px;
		line-height: 1.6;
	}

	.info-box a {
		color: white;
		font-weight: 600;
		text-decoration: underline;
	}
</style>
