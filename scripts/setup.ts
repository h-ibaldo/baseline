/**
 * Setup Script - Phase 1
 * Creates first admin user for development
 */

import { db } from '../src/lib/server/db/client.js';
import { hashPassword } from '../src/lib/server/services/auth.js';
import { createInterface } from 'readline';

const rl = createInterface({
	input: process.stdin,
	output: process.stdout
});

function question(prompt: string): Promise<string> {
	return new Promise((resolve) => {
		rl.question(prompt, resolve);
	});
}

async function main() {
	console.log('\n🚀 LineBasis Setup - Phase 1');
	console.log('============================\n');

	console.log('Creating your first admin user...\n');

	const name = await question('Full name: ');
	const email = await question('Email: ');
	let password = await question('Password (min 8 chars): ');

	// Validate password
	while (password.length < 8) {
		console.log('❌ Password must be at least 8 characters');
		password = await question('Password (min 8 chars): ');
	}

	// Check if user already exists
	const existing = await db.user.findUnique({ where: { email } });

	if (existing) {
		console.log('\n⚠️  User with this email already exists!');
		const overwrite = await question('Replace existing user? (yes/no): ');

		if (overwrite.toLowerCase() !== 'yes') {
			console.log('❌ Setup cancelled');
			rl.close();
			process.exit(0);
		}

		// Delete existing user
		await db.user.delete({ where: { email } });
		console.log('✓ Existing user deleted');
	}

	// Hash password
	const passwordHash = await hashPassword(password);

	// Create user with 'owner' role (highest permission)
	const user = await db.user.create({
		data: {
			name,
			email,
			passwordHash,
			role: 'owner'
		}
	});

	console.log('\n✅ Admin user created successfully!');
	console.log('\nCredentials:');
	console.log(`  Email: ${user.email}`);
	console.log(`  Role: ${user.role}`);
	console.log('\n🎉 Setup complete! Start the dev server with: npm run dev');
	console.log('   Login at: http://localhost:5173/admin/login\n');

	rl.close();
	await db.$disconnect();
}

main().catch((error) => {
	console.error('\n❌ Setup failed:', error);
	process.exit(1);
});
