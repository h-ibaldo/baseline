/**
 * Design Tokens Service
 * Manages global design system tokens
 */

import { db } from '../db/client';
import { defaultTokens, type DesignTokens } from '$lib/types/tokens';

const TOKENS_KEY = 'design_tokens';

/**
 * Get design tokens for a team
 * Returns default tokens if none exist
 */
export async function getTokens(teamId: string): Promise<DesignTokens> {
	const setting = await db.setting.findUnique({
		where: { key: `${TOKENS_KEY}_${teamId}` }
	});

	if (!setting) {
		return defaultTokens;
	}

	try {
		return JSON.parse(setting.value) as DesignTokens;
	} catch (error) {
		console.error('Failed to parse design tokens:', error);
		return defaultTokens;
	}
}

/**
 * Update design tokens for a team
 */
export async function updateTokens(teamId: string, tokens: DesignTokens): Promise<DesignTokens> {
	const key = `${TOKENS_KEY}_${teamId}`;

	await db.setting.upsert({
		where: { key },
		create: {
			key,
			value: JSON.stringify(tokens),
			type: 'json',
			description: 'Design system tokens'
		},
		update: {
			value: JSON.stringify(tokens)
		}
	});

	return tokens;
}

/**
 * Reset tokens to defaults
 */
export async function resetTokens(teamId: string): Promise<DesignTokens> {
	return updateTokens(teamId, defaultTokens);
}

/**
 * Get CSS custom properties from tokens
 * Converts design tokens to CSS variables
 */
export function tokensToCss(tokens: DesignTokens): string {
	const css: string[] = [':root {'];

	// Colors
	Object.entries(tokens.colors).forEach(([key, value]) => {
		css.push(`  --color-${key}: ${value};`);
	});

	// Typography
	Object.entries(tokens.typography).forEach(([key, value]) => {
		css.push(`  --font-${key}-family: ${value.fontFamily};`);
		css.push(`  --font-${key}-size: ${value.fontSize};`);
		css.push(`  --font-${key}-weight: ${value.fontWeight};`);
		css.push(`  --font-${key}-line-height: ${value.lineHeight};`);
		if (value.letterSpacing) {
			css.push(`  --font-${key}-letter-spacing: ${value.letterSpacing};`);
		}
	});

	// Spacing
	css.push(`  --spacing-base-unit: ${tokens.spacing.baseUnit}px;`);
	Object.entries(tokens.spacing).forEach(([key, value]) => {
		if (key !== 'baseUnit') {
			css.push(`  --spacing-${key}: ${value};`);
		}
	});

	// Effects - Border Radius
	Object.entries(tokens.effects.borderRadius).forEach(([key, value]) => {
		css.push(`  --radius-${key}: ${value};`);
	});

	// Effects - Shadow
	Object.entries(tokens.effects.shadow).forEach(([key, value]) => {
		css.push(`  --shadow-${key}: ${value};`);
	});

	// Effects - Transition
	Object.entries(tokens.effects.transition).forEach(([key, value]) => {
		css.push(`  --transition-${key}: ${value};`);
	});

	// Baseline
	css.push(`  --baseline-grid-unit: ${tokens.baseline.gridUnit}px;`);
	css.push(`  --baseline-line-height: ${tokens.baseline.lineHeightMultiplier};`);

	css.push('}');

	return css.join('\n');
}
