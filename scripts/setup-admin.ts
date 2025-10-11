/**
 * Setup Script - Create First Admin User
 * Run with: npx tsx scripts/setup-admin.ts
 */

import { db } from '../src/lib/server/db/client';
import { hashPassword } from '../src/lib/server/services/auth';

async function setupAdmin() {
	console.log('🔧 Setting up LineBasis CMS...\n');

	// Check if admin already exists
	const existingAdmin = await db.user.findFirst({
		where: { role: 'admin' }
	});

	if (existingAdmin) {
		console.log('✅ Admin user already exists:');
		console.log(`   Email: ${existingAdmin.email}`);
		console.log(`   Name: ${existingAdmin.name}`);
		console.log('\n💡 Use this account to login to /admin/login');
		return;
	}

	// Create admin user
	console.log('📝 Creating admin user...');

	const adminEmail = 'admin@linebasis.com';
	const adminPassword = 'admin123';
	const passwordHash = await hashPassword(adminPassword);

	const admin = await db.user.create({
		data: {
			email: adminEmail,
			passwordHash,
			name: 'Admin User',
			role: 'admin',
			status: 'active'
		}
	});

	console.log('\n✅ Admin user created successfully!');
	console.log('\n📋 Login credentials:');
	console.log(`   Email: ${adminEmail}`);
	console.log(`   Password: ${adminPassword}`);
	console.log('\n🚀 Start the dev server and visit: http://localhost:5173/admin/login');
	console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
}

setupAdmin()
	.catch((error) => {
		console.error('❌ Setup failed:', error);
		process.exit(1);
	})
	.finally(() => {
		db.$disconnect();
	});
