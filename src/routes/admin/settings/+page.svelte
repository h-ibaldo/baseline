<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface User {
		id: string;
		email: string;
		name: string;
		role: string;
	}

	interface SiteSettings {
		siteName: string;
		siteDescription: string;
		siteUrl: string;
		allowRegistration: boolean;
		defaultRole: 'admin' | 'editor' | 'author';
	}

	let user: User | null = null;
	let loading = true;
	let saving = false;
	let error = '';
	let success = '';

	// User profile form
	let profileForm = {
		name: '',
		email: '',
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	};
	let profileError = '';
	let profileSuccess = '';

	// Site settings form
	let siteSettings: SiteSettings = {
		siteName: 'LineBasis',
		siteDescription: 'Open-source designer-first CMS',
		siteUrl: 'http://localhost:5173',
		allowRegistration: false,
		defaultRole: 'author'
	};
	let settingsError = '';
	let settingsSuccess = '';

	onMount(() => {
		loadUserProfile();
		loadSiteSettings();
	});

	async function loadUserProfile() {
		try {
			loading = true;
			const token = localStorage.getItem('access_token');
			if (!token) {
				goto('/admin/login');
				return;
			}

			const response = await fetch('/api/auth/me', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.status === 401) {
				goto('/admin/login');
				return;
			}

			if (!response.ok) {
				throw new Error('Failed to load user profile');
			}

			user = await response.json();
			profileForm.name = user.name;
			profileForm.email = user.email;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load profile';
		} finally {
			loading = false;
		}
	}

	async function loadSiteSettings() {
		try {
			const token = localStorage.getItem('access_token');
			const response = await fetch('/api/settings', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				if (data.settings) {
					siteSettings = {
						siteName: data.settings.find((s: any) => s.key === 'site_name')?.value || 'LineBasis',
						siteDescription:
							data.settings.find((s: any) => s.key === 'site_description')?.value ||
							'Open-source designer-first CMS',
						siteUrl:
							data.settings.find((s: any) => s.key === 'site_url')?.value ||
							'http://localhost:5173',
						allowRegistration:
							data.settings.find((s: any) => s.key === 'allow_registration')?.value === 'true',
						defaultRole:
							data.settings.find((s: any) => s.key === 'default_role')?.value || 'author'
					};
				}
			}
		} catch (err) {
			console.error('Failed to load settings:', err);
		}
	}

	async function handleProfileUpdate() {
		try {
			profileError = '';
			profileSuccess = '';

			// Validation
			if (!profileForm.name || !profileForm.email) {
				profileError = 'Name and email are required';
				return;
			}

			if (profileForm.newPassword) {
				if (!profileForm.currentPassword) {
					profileError = 'Current password is required to set a new password';
					return;
				}
				if (profileForm.newPassword !== profileForm.confirmPassword) {
					profileError = 'New passwords do not match';
					return;
				}
				if (profileForm.newPassword.length < 6) {
					profileError = 'New password must be at least 6 characters';
					return;
				}
			}

			saving = true;
			const token = localStorage.getItem('access_token');

			const body: any = {
				name: profileForm.name,
				email: profileForm.email
			};

			if (profileForm.newPassword) {
				body.currentPassword = profileForm.currentPassword;
				body.password = profileForm.newPassword;
			}

			const response = await fetch(`/api/users/${user?.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(body)
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to update profile');
			}

			profileSuccess = 'Profile updated successfully';
			profileForm.currentPassword = '';
			profileForm.newPassword = '';
			profileForm.confirmPassword = '';

			// Reload user data
			await loadUserProfile();
		} catch (err) {
			profileError = err instanceof Error ? err.message : 'Failed to update profile';
		} finally {
			saving = false;
		}
	}

	async function handleSettingsUpdate() {
		try {
			settingsError = '';
			settingsSuccess = '';
			saving = true;

			const token = localStorage.getItem('access_token');

			// Update each setting
			const updates = [
				{ key: 'site_name', value: siteSettings.siteName },
				{ key: 'site_description', value: siteSettings.siteDescription },
				{ key: 'site_url', value: siteSettings.siteUrl },
				{ key: 'allow_registration', value: siteSettings.allowRegistration.toString() },
				{ key: 'default_role', value: siteSettings.defaultRole }
			];

			for (const update of updates) {
				await fetch('/api/settings', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify(update)
				});
			}

			settingsSuccess = 'Settings saved successfully';
		} catch (err) {
			settingsError = err instanceof Error ? err.message : 'Failed to save settings';
		} finally {
			saving = false;
		}
	}
</script>

<div class="settings-page">
	<header class="page-header">
		<div class="header-content">
			<h1>Settings</h1>
			<p class="subtitle">Manage your profile and site settings</p>
		</div>
	</header>

	{#if error}
		<div class="error-banner">
			<span>⚠️ {error}</span>
			<button on:click={() => (error = '')}>✕</button>
		</div>
	{/if}

	{#if loading}
		<div class="loading">Loading settings...</div>
	{:else}
		<div class="settings-container">
			<!-- User Profile Section -->
			<section class="settings-section">
				<h2>👤 User Profile</h2>
				<p class="section-desc">Update your personal information and password</p>

				{#if profileError}
					<div class="form-error">{profileError}</div>
				{/if}

				{#if profileSuccess}
					<div class="form-success">{profileSuccess}</div>
				{/if}

				<form on:submit|preventDefault={handleProfileUpdate}>
					<div class="form-group">
						<label for="name">Name *</label>
						<input id="name" type="text" bind:value={profileForm.name} required />
					</div>

					<div class="form-group">
						<label for="email">Email *</label>
						<input id="email" type="email" bind:value={profileForm.email} required />
					</div>

					<div class="divider"></div>

					<h3>Change Password</h3>

					<div class="form-group">
						<label for="currentPassword">Current Password</label>
						<input
							id="currentPassword"
							type="password"
							bind:value={profileForm.currentPassword}
							placeholder="Enter current password"
						/>
					</div>

					<div class="form-group">
						<label for="newPassword">New Password</label>
						<input
							id="newPassword"
							type="password"
							bind:value={profileForm.newPassword}
							placeholder="Enter new password (min 6 characters)"
						/>
					</div>

					<div class="form-group">
						<label for="confirmPassword">Confirm New Password</label>
						<input
							id="confirmPassword"
							type="password"
							bind:value={profileForm.confirmPassword}
							placeholder="Confirm new password"
						/>
					</div>

					<button type="submit" class="btn-primary" disabled={saving}>
						{saving ? 'Saving...' : 'Update Profile'}
					</button>
				</form>
			</section>

			<!-- Site Settings Section (Admin only) -->
			{#if user?.role === 'admin'}
				<section class="settings-section">
					<h2>⚙️ Site Settings</h2>
					<p class="section-desc">Configure global site settings</p>

					{#if settingsError}
						<div class="form-error">{settingsError}</div>
					{/if}

					{#if settingsSuccess}
						<div class="form-success">{settingsSuccess}</div>
					{/if}

					<form on:submit|preventDefault={handleSettingsUpdate}>
						<div class="form-group">
							<label for="siteName">Site Name *</label>
							<input
								id="siteName"
								type="text"
								bind:value={siteSettings.siteName}
								required
								placeholder="LineBasis"
							/>
						</div>

						<div class="form-group">
							<label for="siteDescription">Site Description</label>
							<textarea
								id="siteDescription"
								bind:value={siteSettings.siteDescription}
								rows="3"
								placeholder="Describe your site..."
							></textarea>
						</div>

						<div class="form-group">
							<label for="siteUrl">Site URL *</label>
							<input
								id="siteUrl"
								type="url"
								bind:value={siteSettings.siteUrl}
								required
								placeholder="https://example.com"
							/>
						</div>

						<div class="form-group">
							<label class="checkbox-label">
								<input type="checkbox" bind:checked={siteSettings.allowRegistration} />
								<span>Allow user registration</span>
							</label>
							<p class="field-help">Enable public user registration</p>
						</div>

						<div class="form-group">
							<label for="defaultRole">Default Role for New Users</label>
							<select id="defaultRole" bind:value={siteSettings.defaultRole}>
								<option value="author">Author</option>
								<option value="editor">Editor</option>
								<option value="admin">Admin</option>
							</select>
							<p class="field-help">Role assigned to newly registered users</p>
						</div>

						<button type="submit" class="btn-primary" disabled={saving}>
							{saving ? 'Saving...' : 'Save Settings'}
						</button>
					</form>
				</section>
			{/if}

			<!-- Danger Zone (Admin only) -->
			{#if user?.role === 'admin'}
				<section class="settings-section danger-zone">
					<h2>⚠️ Danger Zone</h2>
					<p class="section-desc">Irreversible and destructive actions</p>

					<div class="danger-actions">
						<div class="danger-item">
							<div>
								<strong>Clear All Media</strong>
								<p>Delete all uploaded media files. This cannot be undone.</p>
							</div>
							<button class="btn-danger">Clear Media</button>
						</div>

						<div class="danger-item">
							<div>
								<strong>Reset Database</strong>
								<p>Reset database to initial state. All data will be lost.</p>
							</div>
							<button class="btn-danger">Reset Database</button>
						</div>
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>

<style>
	.settings-page {
		max-width: 900px;
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

	.loading {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-text-muted);
	}

	.settings-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.settings-section {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.settings-section h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		color: var(--color-text);
	}

	.settings-section h3 {
		margin: 1.5rem 0 1rem 0;
		font-size: 1.1rem;
		color: var(--color-text);
	}

	.section-desc {
		margin: 0 0 1.5rem 0;
		color: var(--color-text-muted);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 0.95rem;
		font-family: inherit;
	}

	.form-group textarea {
		resize: vertical;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		margin-bottom: 0;
	}

	.checkbox-label input[type='checkbox'] {
		width: auto;
		cursor: pointer;
	}

	.checkbox-label span {
		font-weight: 500;
	}

	.field-help {
		margin: 0.5rem 0 0 0;
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.divider {
		height: 1px;
		background: var(--color-border);
		margin: 2rem 0;
	}

	.form-error {
		background: #fee;
		border: 1px solid #fcc;
		border-radius: 8px;
		padding: 0.75rem;
		margin-bottom: 1rem;
		color: #c00;
		font-size: 0.9rem;
	}

	.form-success {
		background: #e8f5e9;
		border: 1px solid #c8e6c9;
		border-radius: 8px;
		padding: 0.75rem;
		margin-bottom: 1rem;
		color: #2e7d32;
		font-size: 0.9rem;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
		transform: translateY(-1px);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.danger-zone {
		border: 2px solid #fcc;
		background: #fff5f5;
	}

	.danger-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.danger-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: white;
		border-radius: 8px;
		border: 1px solid #fcc;
	}

	.danger-item strong {
		display: block;
		margin-bottom: 0.25rem;
		color: var(--color-text);
	}

	.danger-item p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.btn-danger {
		background: #d32f2f;
		color: white;
		border: none;
		padding: 0.6rem 1.2rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-danger:hover {
		background: #c62828;
	}
</style>
