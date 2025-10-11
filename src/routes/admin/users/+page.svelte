<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	interface User {
		id: string;
		email: string;
		name: string;
		role: 'admin' | 'editor' | 'author';
		status: 'active' | 'suspended';
		createdAt: string;
		lastLoginAt: string | null;
	}

	interface UserFormData {
		email: string;
		name: string;
		password: string;
		role: 'admin' | 'editor' | 'author';
		status: 'active' | 'suspended';
	}

	let users: User[] = [];
	let filteredUsers: User[] = [];
	let loading = true;
	let error = '';
	let searchQuery = '';
	let roleFilter: 'all' | 'admin' | 'editor' | 'author' = 'all';
	let statusFilter: 'all' | 'active' | 'suspended' = 'all';

	// Modal state
	let showModal = false;
	let modalMode: 'create' | 'edit' = 'create';
	let editingUser: User | null = null;
	let formData: UserFormData = {
		email: '',
		name: '',
		password: '',
		role: 'author',
		status: 'active'
	};
	let formError = '';
	let formLoading = false;

	// Delete confirmation
	let deleteConfirmUser: User | null = null;

	onMount(() => {
		loadUsers();
	});

	async function loadUsers() {
		try {
			loading = true;
			error = '';

			const token = localStorage.getItem('access_token');
			if (!token) {
				goto('/admin/login');
				return;
			}

			const response = await fetch('/api/users', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.status === 401) {
				goto('/admin/login');
				return;
			}

			if (!response.ok) {
				throw new Error('Failed to load users');
			}

			const data = await response.json();
			users = data.users || [];
			applyFilters();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load users';
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		filteredUsers = users.filter((user) => {
			const matchesSearch =
				searchQuery === '' ||
				user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.email.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesRole = roleFilter === 'all' || user.role === roleFilter;
			const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

			return matchesSearch && matchesRole && matchesStatus;
		});
	}

	function handleSearchInput(e: Event) {
		searchQuery = (e.target as HTMLInputElement).value;
		applyFilters();
	}

	function handleRoleFilter(e: Event) {
		roleFilter = (e.target as HTMLSelectElement).value as typeof roleFilter;
		applyFilters();
	}

	function handleStatusFilter(e: Event) {
		statusFilter = (e.target as HTMLSelectElement).value as typeof statusFilter;
		applyFilters();
	}

	function openCreateModal() {
		modalMode = 'create';
		editingUser = null;
		formData = {
			email: '',
			name: '',
			password: '',
			role: 'author',
			status: 'active'
		};
		formError = '';
		showModal = true;
	}

	function openEditModal(user: User) {
		modalMode = 'edit';
		editingUser = user;
		formData = {
			email: user.email,
			name: user.name,
			password: '', // Don't pre-fill password
			role: user.role,
			status: user.status
		};
		formError = '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingUser = null;
		formError = '';
	}

	async function handleSubmit() {
		try {
			formLoading = true;
			formError = '';

			// Validation
			if (!formData.email || !formData.name) {
				formError = 'Email and name are required';
				return;
			}

			if (modalMode === 'create' && !formData.password) {
				formError = 'Password is required for new users';
				return;
			}

			const token = localStorage.getItem('access_token');
			const url = modalMode === 'create' ? '/api/users' : `/api/users/${editingUser?.id}`;
			const method = modalMode === 'create' ? 'POST' : 'PATCH';

			const body: any = {
				email: formData.email,
				name: formData.name,
				role: formData.role,
				status: formData.status
			};

			// Only include password if provided
			if (formData.password) {
				body.password = formData.password;
			}

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(body)
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to save user');
			}

			closeModal();
			await loadUsers();
		} catch (err) {
			formError = err instanceof Error ? err.message : 'Failed to save user';
		} finally {
			formLoading = false;
		}
	}

	async function toggleUserStatus(user: User) {
		try {
			const token = localStorage.getItem('access_token');
			const newStatus = user.status === 'active' ? 'suspended' : 'active';

			const response = await fetch(`/api/users/${user.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ status: newStatus })
			});

			if (!response.ok) {
				throw new Error('Failed to update user status');
			}

			await loadUsers();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update user status';
		}
	}

	async function deleteUser() {
		if (!deleteConfirmUser) return;

		try {
			const token = localStorage.getItem('access_token');

			const response = await fetch(`/api/users/${deleteConfirmUser.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error('Failed to delete user');
			}

			deleteConfirmUser = null;
			await loadUsers();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete user';
		}
	}

	function getRoleBadgeClass(role: string): string {
		switch (role) {
			case 'admin':
				return 'badge-admin';
			case 'editor':
				return 'badge-editor';
			case 'author':
				return 'badge-author';
			default:
				return 'badge-default';
		}
	}

	function getStatusBadgeClass(status: string): string {
		return status === 'active' ? 'badge-active' : 'badge-suspended';
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="users-page">
	<header class="page-header">
		<div class="header-content">
			<h1>Users</h1>
			<p class="subtitle">Manage user accounts and permissions</p>
		</div>
		<button class="btn-primary" on:click={openCreateModal}>Add User</button>
	</header>

	{#if error}
		<div class="error-banner">
			<span>⚠️ {error}</span>
			<button on:click={() => (error = '')}>✕</button>
		</div>
	{/if}

	<div class="filters">
		<div class="search-box">
			<span class="search-icon">🔍</span>
			<input
				type="text"
				placeholder="Search by name or email..."
				value={searchQuery}
				on:input={handleSearchInput}
			/>
		</div>

		<select value={roleFilter} on:change={handleRoleFilter} class="filter-select">
			<option value="all">All Roles</option>
			<option value="admin">Admin</option>
			<option value="editor">Editor</option>
			<option value="author">Author</option>
		</select>

		<select value={statusFilter} on:change={handleStatusFilter} class="filter-select">
			<option value="all">All Status</option>
			<option value="active">Active</option>
			<option value="suspended">Suspended</option>
		</select>
	</div>

	{#if loading}
		<div class="loading">Loading users...</div>
	{:else if filteredUsers.length === 0}
		<div class="empty-state">
			<div class="empty-icon">👥</div>
			<h3>No users found</h3>
			<p>
				{searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
					? 'Try adjusting your filters'
					: 'Get started by adding your first user'}
			</p>
			{#if !searchQuery && roleFilter === 'all' && statusFilter === 'all'}
				<button class="btn-primary" on:click={openCreateModal}>Add User</button>
			{/if}
		</div>
	{:else}
		<div class="users-table-container">
			<table class="users-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Role</th>
						<th>Status</th>
						<th>Last Login</th>
						<th>Created</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredUsers as user (user.id)}
						<tr>
							<td>
								<div class="user-name">{user.name}</div>
							</td>
							<td>
								<div class="user-email">{user.email}</div>
							</td>
							<td>
								<span class="badge {getRoleBadgeClass(user.role)}">{user.role}</span>
							</td>
							<td>
								<span class="badge {getStatusBadgeClass(user.status)}">{user.status}</span>
							</td>
							<td class="date-cell">{formatDate(user.lastLoginAt)}</td>
							<td class="date-cell">{formatDate(user.createdAt)}</td>
							<td>
								<div class="actions">
									<button class="btn-icon" on:click={() => openEditModal(user)} title="Edit user">
										✏️
									</button>
									<button
										class="btn-icon"
										on:click={() => toggleUserStatus(user)}
										title={user.status === 'active' ? 'Suspend user' : 'Activate user'}
									>
										{user.status === 'active' ? '🚫' : '✅'}
									</button>
									<button
										class="btn-icon btn-danger"
										on:click={() => (deleteConfirmUser = user)}
										title="Delete user"
									>
										🗑️
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="table-footer">
			<p>Showing {filteredUsers.length} of {users.length} users</p>
		</div>
	{/if}
</div>

{#if showModal}
	<div class="modal-overlay" on:click={closeModal}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>{modalMode === 'create' ? 'Add New User' : 'Edit User'}</h2>
				<button class="btn-close" on:click={closeModal}>✕</button>
			</div>

			<form on:submit|preventDefault={handleSubmit}>
				<div class="form-group">
					<label for="name">Name *</label>
					<input
						id="name"
						type="text"
						bind:value={formData.name}
						required
						placeholder="John Doe"
					/>
				</div>

				<div class="form-group">
					<label for="email">Email *</label>
					<input
						id="email"
						type="email"
						bind:value={formData.email}
						required
						placeholder="john@example.com"
					/>
				</div>

				<div class="form-group">
					<label for="password">
						Password {modalMode === 'edit' ? '(leave blank to keep current)' : '*'}
					</label>
					<input
						id="password"
						type="password"
						bind:value={formData.password}
						required={modalMode === 'create'}
						placeholder={modalMode === 'create' ? 'Enter password' : 'Enter new password'}
					/>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="role">Role *</label>
						<select id="role" bind:value={formData.role} required>
							<option value="author">Author</option>
							<option value="editor">Editor</option>
							<option value="admin">Admin</option>
						</select>
					</div>

					<div class="form-group">
						<label for="status">Status *</label>
						<select id="status" bind:value={formData.status} required>
							<option value="active">Active</option>
							<option value="suspended">Suspended</option>
						</select>
					</div>
				</div>

				{#if formError}
					<div class="form-error">{formError}</div>
				{/if}

				<div class="modal-actions">
					<button type="button" class="btn-secondary" on:click={closeModal}>Cancel</button>
					<button type="submit" class="btn-primary" disabled={formLoading}>
						{formLoading ? 'Saving...' : modalMode === 'create' ? 'Create User' : 'Save Changes'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if deleteConfirmUser}
	<div class="modal-overlay" on:click={() => (deleteConfirmUser = null)}>
		<div class="modal modal-small" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Delete User</h2>
				<button class="btn-close" on:click={() => (deleteConfirmUser = null)}>✕</button>
			</div>

			<div class="modal-body">
				<p>
					Are you sure you want to delete <strong>{deleteConfirmUser.name}</strong>? This action
					cannot be undone.
				</p>
			</div>

			<div class="modal-actions">
				<button class="btn-secondary" on:click={() => (deleteConfirmUser = null)}>Cancel</button>
				<button class="btn-danger" on:click={deleteUser}>Delete User</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.users-page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.header-content h1 {
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

	.filters {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.search-box {
		position: relative;
		flex: 1;
		min-width: 250px;
	}

	.search-icon {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-muted);
	}

	.search-box input {
		width: 100%;
		padding: 0.75rem 0.75rem 0.75rem 2.5rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 0.95rem;
	}

	.filter-select {
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: white;
		cursor: pointer;
		font-size: 0.95rem;
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
		margin: 0 0 1.5rem 0;
	}

	.users-table-container {
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow-x: auto;
	}

	.users-table {
		width: 100%;
		border-collapse: collapse;
	}

	.users-table th {
		text-align: left;
		padding: 1rem;
		border-bottom: 2px solid var(--color-border);
		font-weight: 600;
		color: var(--color-text);
		background: var(--color-bg-secondary);
	}

	.users-table td {
		padding: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.users-table tbody tr:hover {
		background: var(--color-bg-secondary);
	}

	.user-name {
		font-weight: 500;
		color: var(--color-text);
	}

	.user-email {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.date-cell {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.85rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.badge-admin {
		background: #e3f2fd;
		color: #1565c0;
	}

	.badge-editor {
		background: #f3e5f5;
		color: #6a1b9a;
	}

	.badge-author {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.badge-active {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.badge-suspended {
		background: #fce4ec;
		color: #c2185b;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-icon {
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 0.4rem 0.6rem;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s;
	}

	.btn-icon:hover {
		background: var(--color-bg-secondary);
		transform: translateY(-1px);
	}

	.btn-danger:hover {
		background: #fee;
		border-color: #fcc;
	}

	.table-footer {
		padding: 1rem;
		text-align: center;
		color: var(--color-text-muted);
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
	}

	.btn-secondary {
		background: white;
		color: var(--color-text);
		border: 1px solid var(--color-border);
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.95rem;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: var(--color-bg-secondary);
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: white;
		border-radius: 12px;
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.modal-small {
		max-width: 400px;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--color-text);
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--color-text-muted);
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.btn-close:hover {
		background: var(--color-bg-secondary);
	}

	.modal form {
		padding: 1.5rem;
	}

	.modal-body {
		padding: 1.5rem;
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
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 0.95rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
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

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		padding: 1.5rem;
		border-top: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		margin: 0 -1.5rem -1.5rem -1.5rem;
		border-radius: 0 0 12px 12px;
	}

	.btn-danger {
		background: #d32f2f;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.95rem;
		transition: all 0.2s;
	}

	.btn-danger:hover {
		background: #c62828;
	}
</style>
