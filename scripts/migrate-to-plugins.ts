#!/usr/bin/env tsx

/**
 * Plugin Architecture Migration Script
 *
 * Detects existing blog installations and migrates them to the plugin system.
 * Also handles symlinking plugin routes to make them accessible.
 *
 * Usage:
 *   npm run migrate:plugins
 *   npm run migrate:plugins -- --dry-run
 */

import { readFileSync, writeFileSync, existsSync, symlinkSync, unlinkSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { db } from '../src/lib/server/db/client';
import { execSync } from 'child_process';

interface MigrationResult {
	blogDetected: boolean;
	blogMigrated: boolean;
	routesSymlinked: string[];
	errors: string[];
}

async function detectBlogData(): Promise<boolean> {
	try {
		// Check if blog tables exist by querying
		const posts = await db.$queryRaw`SELECT COUNT(*) as count FROM Post LIMIT 1`;
		return true;
	} catch (error) {
		// Table doesn't exist
		return false;
	}
}

async function isBlogPluginInstalled(): Promise<boolean> {
	try {
		const plugin = await db.plugin.findUnique({
			where: { id: '@linebasis/blog' }
		});
		return !!plugin;
	} catch (error) {
		return false;
	}
}

async function installBlogPlugin(): Promise<void> {
	await db.plugin.create({
		data: {
			id: '@linebasis/blog',
			name: 'Blog System',
			version: '1.0.0',
			isActive: true,
			settings: '{}'
		}
	});
}

function symlinkPluginRoutes(pluginId: string, isDryRun: boolean): string[] {
	const symlinked: string[] = [];

	// Convert plugin ID to folder name
	const pluginFolder = pluginId.split('/')[1]; // @linebasis/blog -> blog
	const pluginRoutesDir = join(process.cwd(), 'plugins', pluginFolder, 'server', 'routes');

	if (!existsSync(pluginRoutesDir)) {
		console.log(`   ℹ️  No routes directory found for plugin: ${pluginId}`);
		return symlinked;
	}

	// Get all route folders in plugin
	const routeFolders = readdirSync(pluginRoutesDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	// Symlink each route folder to src/routes/api/
	for (const routeFolder of routeFolders) {
		const sourcePath = join(pluginRoutesDir, routeFolder);
		const targetPath = join(process.cwd(), 'src', 'routes', 'api', routeFolder);

		if (existsSync(targetPath)) {
			console.log(`   ⏭️  Route already exists: /api/${routeFolder}`);
			continue;
		}

		if (!isDryRun) {
			try {
				symlinkSync(sourcePath, targetPath, 'dir');
				symlinked.push(`/api/${routeFolder}`);
				console.log(`   🔗 Symlinked route: /api/${routeFolder}`);
			} catch (error: any) {
				console.error(`   ❌ Failed to symlink /api/${routeFolder}:`, error.message);
			}
		} else {
			symlinked.push(`/api/${routeFolder} (dry-run)`);
			console.log(`   🔗 Would symlink: /api/${routeFolder}`);
		}
	}

	return symlinked;
}

async function main() {
	const isDryRun = process.argv.includes('--dry-run');
	const result: MigrationResult = {
		blogDetected: false,
		blogMigrated: false,
		routesSymlinked: [],
		errors: []
	};

	console.log('🔄 Plugin Architecture Migration Tool\n');

	if (isDryRun) {
		console.log('🔍 DRY RUN MODE - No changes will be made\n');
	}

	// Step 1: Detect blog data
	console.log('1️⃣  Checking for existing blog data...');
	const hasBlogData = await detectBlogData();
	result.blogDetected = hasBlogData;

	if (hasBlogData) {
		console.log('   ✅ Blog data detected in database');
	} else {
		console.log('   ℹ️  No blog data found');
	}

	// Step 2: Check if blog plugin is already installed
	console.log('\n2️⃣  Checking blog plugin status...');
	const blogInstalled = await isBlogPluginInstalled();

	if (blogInstalled) {
		console.log('   ✅ Blog plugin is already installed');
		const plugin = await db.plugin.findUnique({ where: { id: '@linebasis/blog' } });
		if (plugin?.isActive) {
			console.log('   ✅ Blog plugin is active');
		} else {
			console.log('   ⚠️  Blog plugin is installed but NOT active');
			if (!isDryRun && hasBlogData) {
				console.log('   🔄 Activating blog plugin...');
				await db.plugin.update({
					where: { id: '@linebasis/blog' },
					data: { isActive: true }
				});
				console.log('   ✅ Blog plugin activated');
				result.blogMigrated = true;
			}
		}
	} else if (hasBlogData) {
		// Blog data exists but plugin not installed
		console.log('   ⚠️  Blog data exists but plugin not installed');
		console.log('   📦 Installing blog plugin...');

		if (!isDryRun) {
			await installBlogPlugin();
			console.log('   ✅ Blog plugin installed and activated');
			result.blogMigrated = true;
		} else {
			console.log('   ✅ Would install blog plugin (dry-run)');
		}
	} else {
		console.log('   ℹ️  Blog plugin not needed (no blog data)');
	}

	// Step 3: Symlink plugin routes
	console.log('\n3️⃣  Setting up plugin routes...');

	if (blogInstalled || (hasBlogData && !isDryRun)) {
		const symlinked = symlinkPluginRoutes('@linebasis/blog', isDryRun);
		result.routesSymlinked = symlinked;

		if (symlinked.length === 0) {
			console.log('   ℹ️  No new routes to symlink');
		}
	} else {
		console.log('   ⏭️  Skipping (blog plugin not active)');
	}

	// Step 4: Run schema composition if needed
	if (result.blogMigrated && !isDryRun) {
		console.log('\n4️⃣  Running schema composition...');
		try {
			execSync('npm run db:compose', { stdio: 'inherit' });
			console.log('   ✅ Schema composition complete');
		} catch (error) {
			result.errors.push('Schema composition failed');
			console.error('   ❌ Schema composition failed');
		}
	}

	// Summary
	console.log('\n' + '═'.repeat(80));
	console.log('📊 Migration Summary\n');
	console.log(`   Blog data detected:     ${result.blogDetected ? '✅ Yes' : '❌ No'}`);
	console.log(`   Blog plugin migrated:   ${result.blogMigrated ? '✅ Yes' : '❌ No'}`);
	console.log(`   Routes symlinked:       ${result.routesSymlinked.length}`);
	result.routesSymlinked.forEach((route) => {
		console.log(`      - ${route}`);
	});

	if (result.errors.length > 0) {
		console.log(`\n   ⚠️  Errors: ${result.errors.length}`);
		result.errors.forEach((error) => {
			console.log(`      - ${error}`);
		});
	}

	console.log('═'.repeat(80));

	if (isDryRun) {
		console.log('\n💡 Run without --dry-run to apply changes');
	} else {
		console.log('\n✨ Migration complete!');

		if (result.blogMigrated || result.routesSymlinked.length > 0) {
			console.log('\n💡 Next steps:');
			console.log('   1. Restart your dev server for route changes to take effect');
			console.log('   2. Visit /admin/plugins to manage plugins');
			console.log('   3. Check that blog routes are working: /api/posts');
		}
	}
}

main()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Migration failed:', error);
		process.exit(1);
	});
