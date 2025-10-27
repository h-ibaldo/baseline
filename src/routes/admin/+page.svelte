<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: any = null;
	let isLoading = true;

	onMount(async () => {
		const token = localStorage.getItem('accessToken');

		if (!token) {
			// No token, redirect to login
			goto('/admin/login');
			return;
		}

		try {
			// Verify token and get user info
			const response = await fetch('/api/auth/me', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!response.ok) {
				// Invalid token, redirect to login
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				goto('/admin/login');
				return;
			}

			const data = await response.json();
			user = data.user;
		} catch (err) {
			console.error('Auth error:', err);
			goto('/admin/login');
		} finally {
			isLoading = false;
		}
	});

	function handleLogout() {
		const refreshToken = localStorage.getItem('refreshToken');

		if (refreshToken) {
			// Call logout API
			fetch('/api/auth/logout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refreshToken })
			});
		}

		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		goto('/admin/login');
	}
</script>

<!-- STYLE: Admin dashboard main page -->
<main class="admin-dashboard">
	{#if isLoading}
		<!-- STYLE: Loading state - centered spinner or skeleton -->
		<div class="loading-state">
			<p>Loading...</p>
		</div>
	{:else if user}
		<!-- STYLE: Dashboard header with user info and logout -->
		<header class="dashboard-header">
			<div class="header-content">
				<h1 class="dashboard-title">Dashboard</h1>
				<div class="user-info">
					<span class="user-name">Welcome, {user.name}</span>
					<span class="user-email">{user.email}</span>
					<button class="button-logout" on:click={handleLogout}>Logout</button>
				</div>
			</div>
		</header>

		<!-- STYLE: Dashboard content area -->
		<div class="dashboard-content">
			<!-- STYLE: Quick stats cards -->
			<section class="stats-section">
				<h2 class="section-title">Overview</h2>
				<div class="stats-grid">
					<div class="stat-card">
						<h3 class="stat-label">Pages</h3>
						<p class="stat-value">0</p>
					</div>
					<div class="stat-card">
						<h3 class="stat-label">Published</h3>
						<p class="stat-value">0</p>
					</div>
					<div class="stat-card">
						<h3 class="stat-label">Blocks</h3>
						<p class="stat-value">0</p>
					</div>
					<div class="stat-card">
						<h3 class="stat-label">Media</h3>
						<p class="stat-value">0</p>
					</div>
				</div>
			</section>

			<!-- STYLE: Quick actions -->
			<section class="actions-section">
				<h2 class="section-title">Quick Actions</h2>
				<div class="actions-grid">
					<a href="/admin/pages/new" class="action-card">
						<h3 class="action-title">Create Page</h3>
						<p class="action-description">Start designing a new page</p>
					</a>
					<a href="/admin/media" class="action-card">
						<h3 class="action-title">Upload Media</h3>
						<p class="action-description">Add images and files</p>
					</a>
					<a href="/admin/blocks" class="action-card">
						<h3 class="action-title">Browse Blocks</h3>
						<p class="action-description">View reusable components</p>
					</a>
					<a href="/admin/styles" class="action-card">
						<h3 class="action-title">Design System</h3>
						<p class="action-description">Manage colors and tokens</p>
					</a>
				</div>
			</section>
		</div>
	{/if}
</main>

<!--
  NO STYLES - Ready for Ibaldo's design!

  Functionality included:
  ✅ Authentication check on mount
  ✅ Token verification
  ✅ Redirect to login if not authenticated
  ✅ User info display
  ✅ Logout functionality
  ✅ Dashboard stats (placeholder data)
  ✅ Quick action links
-->
