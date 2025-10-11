#!/usr/bin/env tsx

/**
 * Schema Composition Script
 *
 * Merges the core Prisma schema with active plugin schemas to create
 * a unified schema.prisma file for database operations.
 *
 * Usage:
 *   npm run db:compose
 *   npm run db:compose -- --check  (dry run)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { db } from '../src/lib/server/db/client';

const CORE_SCHEMA_PATH = join(process.cwd(), 'prisma', 'schema.prisma');
const CORE_SCHEMA_BACKUP_PATH = join(process.cwd(), 'prisma', 'schema.core.prisma');
const OUTPUT_SCHEMA_PATH = join(process.cwd(), 'prisma', 'schema.prisma');

async function getActivePlugins() {
	try {
		// Get all active plugins from database
		const activePlugins = await db.plugin.findMany({
			where: { isActive: true }
		});
		return activePlugins;
	} catch (error) {
		console.warn('⚠️  Could not fetch active plugins from database (may not exist yet)');
		return [];
	}
}

function readCoreSchema(): string {
	if (!existsSync(CORE_SCHEMA_PATH)) {
		throw new Error(`Core schema not found at: ${CORE_SCHEMA_PATH}`);
	}
	return readFileSync(CORE_SCHEMA_PATH, 'utf-8');
}

function readPluginSchema(pluginId: string): string | null {
	// Convert plugin ID to folder name (e.g., @linebasis/blog -> blog)
	const pluginFolder = pluginId.split('/')[1];
	const pluginSchemaPath = join(process.cwd(), 'plugins', pluginFolder, 'prisma', 'schema.prisma');

	if (!existsSync(pluginSchemaPath)) {
		console.warn(`⚠️  Plugin schema not found: ${pluginSchemaPath}`);
		return null;
	}

	const schemaContent = readFileSync(pluginSchemaPath, 'utf-8');

	// Remove datasource and generator blocks from plugin schema
	// (we only want the models)
	const lines = schemaContent.split('\n');
	const filteredLines: string[] = [];
	let skipBlock = false;

	for (const line of lines) {
		// Start skipping at datasource or generator blocks
		if (line.trim().startsWith('datasource ') || line.trim().startsWith('generator ')) {
			skipBlock = true;
		}

		// Stop skipping after the closing brace
		if (skipBlock && line.trim() === '}') {
			skipBlock = false;
			continue;
		}

		// Add line if not in skip block
		if (!skipBlock && line.trim() !== '') {
			filteredLines.push(line);
		}
	}

	return filteredLines.join('\n');
}

function composeSchema(coreSchema: string, pluginSchemas: Array<{ id: string; schema: string }>): string {
	const parts: string[] = [coreSchema];

	for (const { id, schema } of pluginSchemas) {
		if (schema.trim()) {
			parts.push(`\n// ========================================`);
			parts.push(`// Plugin: ${id}`);
			parts.push(`// ========================================\n`);
			parts.push(schema);
		}
	}

	return parts.join('\n');
}

async function main() {
	const isDryRun = process.argv.includes('--check');

	console.log('🔨 Prisma Schema Composition Tool\n');

	// Step 1: Read core schema
	console.log('📖 Reading core schema...');
	const coreSchema = readCoreSchema();
	console.log(`   ✅ Core schema loaded (${coreSchema.split('\n').length} lines)`);

	// Step 2: Get active plugins
	console.log('\n🔌 Fetching active plugins...');
	const activePlugins = await getActivePlugins();

	if (activePlugins.length === 0) {
		console.log('   ℹ️  No active plugins found');
		console.log('   ✅ Core schema is complete (no composition needed)');
		return;
	}

	console.log(`   ✅ Found ${activePlugins.length} active plugin(s):`);
	activePlugins.forEach((plugin) => {
		console.log(`      - ${plugin.name} (${plugin.id})`);
	});

	// Step 3: Read plugin schemas
	console.log('\n📖 Reading plugin schemas...');
	const pluginSchemas: Array<{ id: string; schema: string }> = [];

	for (const plugin of activePlugins) {
		const schema = readPluginSchema(plugin.id);
		if (schema) {
			pluginSchemas.push({ id: plugin.id, schema });
			console.log(`   ✅ Loaded schema for ${plugin.name}`);
		} else {
			console.log(`   ⏭️  No schema found for ${plugin.name}`);
		}
	}

	// Step 4: Compose schemas
	console.log('\n🔨 Composing schemas...');
	const composedSchema = composeSchema(coreSchema, pluginSchemas);
	const composedLines = composedSchema.split('\n').length;
	const addedLines = composedLines - coreSchema.split('\n').length;
	console.log(`   ✅ Composed schema: ${composedLines} total lines (+${addedLines} from plugins)`);

	// Step 5: Write output
	if (isDryRun) {
		console.log('\n🔍 Dry run mode - no files written');
		console.log('\nComposed schema preview (first 50 lines):');
		console.log('─'.repeat(80));
		console.log(composedSchema.split('\n').slice(0, 50).join('\n'));
		console.log('─'.repeat(80));
	} else {
		console.log('\n💾 Writing composed schema...');

		// Backup existing schema if different from core
		if (existsSync(OUTPUT_SCHEMA_PATH)) {
			const existing = readFileSync(OUTPUT_SCHEMA_PATH, 'utf-8');
			if (existing !== coreSchema && !existsSync(CORE_SCHEMA_BACKUP_PATH)) {
				writeFileSync(CORE_SCHEMA_BACKUP_PATH, coreSchema, 'utf-8');
				console.log(`   💾 Backed up core schema to: schema.core.prisma`);
			}
		}

		writeFileSync(OUTPUT_SCHEMA_PATH, composedSchema, 'utf-8');
		console.log(`   ✅ Written to: ${OUTPUT_SCHEMA_PATH}`);

		console.log('\n📊 Summary:');
		console.log(`   - Core schema: ${coreSchema.split('\n').length} lines`);
		console.log(`   - Plugin additions: ${addedLines} lines`);
		console.log(`   - Total composed: ${composedLines} lines`);
		console.log(`   - Active plugins: ${activePlugins.length}`);
	}

	console.log('\n✨ Schema composition complete!');

	if (!isDryRun) {
		console.log('\n💡 Next steps:');
		console.log('   1. Review the composed schema: cat prisma/schema.prisma');
		console.log('   2. Generate Prisma client: npx prisma generate');
		console.log('   3. Create migration: npx prisma migrate dev --name add_plugin_schemas');
	}
}

main()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Error:', error.message);
		process.exit(1);
	});
