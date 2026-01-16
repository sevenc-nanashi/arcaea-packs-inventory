import { defineConfig, presetWind4, transformerDirectives } from 'unocss';
import { presetAttributify } from 'unocss/preset-attributify';

export default defineConfig({
	presets: [
		presetWind4(),
		presetAttributify({
			prefixedOnly: true,
		}),
	],
	transformers: [transformerDirectives()],
	theme: {
		fontFamily: {
			sans: 'var(--font-sans)',
			en: 'Exo, sans-serif',
			ja: "'Kazesawa', sans-serif",
		},
		colors: {
			far: '#f6d368',
			pure: '#4cc8dc',

			light: '#87cefa',
			conflict: '#4b0082',

			past: '#5cbad3',
			present: '#b5c770',
			future: '#814270',
			eternal: '#8a7aa5',
			beyond: '#bf0d26',

			arcaea: '#34333e',
		},
	},
	rules: [
		[
			/^align-content-(start|center|end|between|around|evenly)$/,
			([, v]) => ({
				'align-content': v.replace('between', 'space-between').replace('around', 'space-around').replace('evenly', 'space-evenly'),
			}),
		],
	],
});
