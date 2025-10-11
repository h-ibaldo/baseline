<script lang="ts">
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please enter email and password';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Login failed');
			}

			const data = await response.json();

			// Store access token in localStorage
			localStorage.setItem('access_token', data.accessToken);
			localStorage.setItem('user', JSON.stringify(data.user));

			// Redirect to admin dashboard
			goto('/admin');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed';
		} finally {
			loading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<svelte:head>
	<title>Login - LineBasis Admin</title>
</svelte:head>

<div class="login-container">
	<div class="login-card">
		<div class="logo">
			<h1>LineBasis</h1>
			<p>Admin Panel</p>
		</div>

		<form on:submit|preventDefault={handleLogin}>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					on:keydown={handleKeydown}
					placeholder="admin@example.com"
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					on:keydown={handleKeydown}
					placeholder="••••••••"
					required
					disabled={loading}
				/>
			</div>

			{#if error}
				<div class="error">{error}</div>
			{/if}

			<button type="submit" disabled={loading} class="btn-primary">
				{loading ? 'Logging in...' : 'Login'}
			</button>
		</form>

		<p class="hint">
			Default credentials: <code>admin@linebasis.com</code> / <code>admin123</code>
		</p>
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}

	.login-card {
		background: white;
		border-radius: 12px;
		padding: 40px;
		width: 100%;
		max-width: 420px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.logo {
		text-align: center;
		margin-bottom: 32px;
	}

	.logo h1 {
		font-size: 32px;
		font-weight: 700;
		margin: 0 0 8px 0;
		color: #1a202c;
	}

	.logo p {
		font-size: 16px;
		color: #718096;
		margin: 0;
	}

	.form-group {
		margin-bottom: 20px;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #2d3748;
		font-size: 14px;
	}

	input {
		width: 100%;
		padding: 12px 16px;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 16px;
		transition: all 0.2s;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	input:disabled {
		background: #f7fafc;
		cursor: not-allowed;
	}

	.btn-primary {
		width: 100%;
		padding: 14px;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		background: #5568d3;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.error {
		background: #fed7d7;
		color: #c53030;
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 20px;
		font-size: 14px;
	}

	.hint {
		text-align: center;
		color: #718096;
		font-size: 13px;
		margin-top: 24px;
	}

	code {
		background: #edf2f7;
		padding: 2px 6px;
		border-radius: 4px;
		font-family: 'Courier New', monospace;
		font-size: 12px;
	}
</style>
