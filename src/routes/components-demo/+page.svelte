<script lang="ts">
	/**
	 * Component Library Demo
	 * Showcases all baseline-aware design components
	 */
	import Heading from '$lib/components/design/Heading.svelte';
	import Paragraph from '$lib/components/design/Paragraph.svelte';
	import Text from '$lib/components/design/Text.svelte';
	import Container from '$lib/components/design/Container.svelte';
	import Grid from '$lib/components/design/Grid.svelte';
	import Flex from '$lib/components/design/Flex.svelte';
	import Button from '$lib/components/design/Button.svelte';
	import Input from '$lib/components/design/Input.svelte';
	import Select from '$lib/components/design/Select.svelte';
	import BaselineGrid from '$lib/components/baseline/BaselineGrid.svelte';
	import { baselineConfig, toggleBaselineGrid, toggleBaselineSnap } from '$lib/stores/baseline';
	import { getAllComponents, getComponentsByCategory } from '$lib/utils/component-registry';
	import type { HeadingProps, ParagraphProps, TextProps, ButtonProps, InputProps, SelectProps, GridProps, FlexProps } from '$lib/types/components';

	// Get all registered components
	const allComponents = getAllComponents();
	const typographyComponents = getComponentsByCategory('typography');
	const layoutComponents = getComponentsByCategory('layout');
	const formComponents = getComponentsByCategory('form');

	// Sample component props
	const headingProps: HeadingProps = {
		id: 'h1',
		type: 'heading',
		x: 0, y: 0, width: 800, height: 56,
		level: 1,
		text: 'Baseline Component Library',
		fontSize: 48,
		lineHeight: 56,
		fontWeight: 700,
		color: '#000000',
		snapToBaseline: true
	};

	const subtitleProps: HeadingProps = {
		id: 'h2',
		type: 'heading',
		x: 0, y: 0, width: 800, height: 32,
		level: 2,
		text: 'Typography Components',
		fontSize: 32,
		lineHeight: 40,
		fontWeight: 600,
		color: '#333333',
		snapToBaseline: true
	};

	const paragraphProps: ParagraphProps = {
		id: 'p1',
		type: 'paragraph',
		x: 0, y: 0, width: 600, height: 72,
		text: 'This is a baseline-aware paragraph component. Notice how the text aligns perfectly to the baseline grid when it\'s enabled. The line height is a multiple of the baseline height, creating a harmonious vertical rhythm.',
		fontSize: 16,
		lineHeight: 24,
		fontWeight: 400,
		color: '#333333',
		maxWidth: 600,
		snapToBaseline: true
	};

	const textProps: TextProps = {
		id: 't1',
		type: 'text',
		x: 0, y: 0, width: 200, height: 24,
		text: 'Inline text component',
		fontSize: 16,
		lineHeight: 24,
		fontWeight: 400,
		color: '#007bff',
		textDecoration: 'underline',
		snapToBaseline: true
	};

	const gridProps: GridProps = {
		id: 'grid1',
		type: 'grid',
		x: 0, y: 0, width: 800, height: 300,
		columns: 3,
		columnGap: 16,
		rowGap: 16,
		backgroundColor: '#f5f5f5',
		padding: 16,
		borderRadius: 8,
		snapToBaseline: true
	};

	const flexProps: FlexProps = {
		id: 'flex1',
		type: 'flex',
		x: 0, y: 0, width: 800, height: 100,
		direction: 'row',
		gap: 16,
		alignItems: 'center',
		justifyContent: 'start',
		backgroundColor: '#f5f5f5',
		padding: 16,
		borderRadius: 8,
		snapToBaseline: true
	};

	const buttonProps: ButtonProps = {
		id: 'btn1',
		type: 'button',
		x: 0, y: 0, width: 120, height: 40,
		text: 'Primary Button',
		variant: 'primary',
		size: 'medium',
		snapToBaseline: true
	};

	const inputProps: InputProps = {
		id: 'input1',
		type: 'input',
		x: 0, y: 0, width: 300, height: 40,
		inputType: 'text',
		placeholder: 'Enter your name...',
		label: 'Name',
		snapToBaseline: true
	};

	const selectProps: SelectProps = {
		id: 'select1',
		type: 'select',
		x: 0, y: 0, width: 300, height: 40,
		options: [
			{ value: 'option1', label: 'Option 1' },
			{ value: 'option2', label: 'Option 2' },
			{ value: 'option3', label: 'Option 3' }
		],
		placeholder: 'Select an option...',
		label: 'Choose',
		snapToBaseline: true
	};
</script>

<svelte:head>
	<title>Component Library Demo - Baseline</title>
</svelte:head>

<main>
	<header>
		<h1>Component Library Demo</h1>
		<p>Baseline-aware design components with perfect typography alignment</p>
	</header>

	<!-- Baseline Grid Controls -->
	<div class="controls">
		<label>
			<input type="checkbox" checked={$baselineConfig.showGrid} on:change={toggleBaselineGrid} />
			Show Baseline Grid
		</label>

		<label>
			<input type="checkbox" checked={$baselineConfig.enabled} on:change={toggleBaselineSnap} />
			Enable Snap to Baseline
		</label>

		<div class="info">
			Baseline Height: {$baselineConfig.height}px
		</div>
	</div>

	<!-- Component Registry Info -->
	<div class="registry-info">
		<h2>Registered Components</h2>
		<div class="component-counts">
			<span>Total: {allComponents.length}</span>
			<span>Typography: {typographyComponents.length}</span>
			<span>Layout: {layoutComponents.length}</span>
			<span>Form: {formComponents.length}</span>
		</div>
	</div>

	<!-- Baseline Grid Overlay -->
	{#if $baselineConfig.showGrid}
		<BaselineGrid config={$baselineConfig} />
	{/if}

	<!-- Components Showcase -->
	<div class="showcase">
		<!-- Typography Section -->
		<section class="component-section">
			<h2 class="section-title">Typography Components</h2>

			<div class="component-demo">
				<h3>Heading Component</h3>
				<Heading props={headingProps} baselineHeight={$baselineConfig.height} />
			</div>

			<div class="component-demo">
				<h3>Paragraph Component</h3>
				<Paragraph props={paragraphProps} baselineHeight={$baselineConfig.height} />
			</div>

			<div class="component-demo">
				<h3>Text Component</h3>
				<Text props={textProps} baselineHeight={$baselineConfig.height} />
			</div>
		</section>

		<!-- Layout Section -->
		<section class="component-section">
			<h2 class="section-title">Layout Components</h2>

			<div class="component-demo">
				<h3>Grid Layout (3 columns)</h3>
				<Grid props={gridProps} baselineHeight={$baselineConfig.height}>
					<div class="grid-item">Item 1</div>
					<div class="grid-item">Item 2</div>
					<div class="grid-item">Item 3</div>
					<div class="grid-item">Item 4</div>
					<div class="grid-item">Item 5</div>
					<div class="grid-item">Item 6</div>
				</Grid>
			</div>

			<div class="component-demo">
				<h3>Flex Layout</h3>
				<Flex props={flexProps} baselineHeight={$baselineConfig.height}>
					<div class="flex-item">Flex Item 1</div>
					<div class="flex-item">Flex Item 2</div>
					<div class="flex-item">Flex Item 3</div>
				</Flex>
			</div>
		</section>

		<!-- Form Section -->
		<section class="component-section">
			<h2 class="section-title">Form Components</h2>

			<div class="component-demo">
				<h3>Button Component</h3>
				<div class="button-group">
					<Button props={{...buttonProps, text: 'Primary', variant: 'primary'}} />
					<Button props={{...buttonProps, text: 'Secondary', variant: 'secondary'}} />
					<Button props={{...buttonProps, text: 'Outline', variant: 'outline'}} />
					<Button props={{...buttonProps, text: 'Text', variant: 'text'}} />
				</div>
			</div>

			<div class="component-demo">
				<h3>Input Component</h3>
				<Input props={inputProps} baselineHeight={$baselineConfig.height} />
			</div>

			<div class="component-demo">
				<h3>Select Component</h3>
				<Select props={selectProps} baselineHeight={$baselineConfig.height} />
			</div>
		</section>
	</div>
</main>

<style>
	main {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		position: relative;
	}

	header {
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: #000;
	}

	header p {
		color: #666;
		font-size: 1.1rem;
	}

	.controls {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
		padding: 1rem;
		background: #fff;
		border: 2px solid #007bff;
		border-radius: 8px;
		align-items: center;
	}

	.controls label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.info {
		font-size: 0.9rem;
		color: #666;
		padding-left: 1rem;
		border-left: 2px solid #eee;
	}

	.registry-info {
		margin-bottom: 2rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.registry-info h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.2rem;
	}

	.component-counts {
		display: flex;
		gap: 1.5rem;
		font-size: 0.9rem;
		color: #666;
	}

	.showcase {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.component-section {
		background: #fff;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	.section-title {
		margin: 0 0 1.5rem 0;
		font-size: 1.8rem;
		color: #007bff;
		border-bottom: 2px solid #007bff;
		padding-bottom: 0.5rem;
	}

	.component-demo {
		margin-bottom: 2rem;
	}

	.component-demo h3 {
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
		color: #333;
	}

	.grid-item, .flex-item {
		padding: 1rem;
		background: #007bff;
		color: white;
		border-radius: 4px;
		text-align: center;
		font-weight: 500;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}
</style>

