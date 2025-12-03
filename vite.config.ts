import { defineConfig } from 'vite';
import uno from 'unocss/vite';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import yaml from '@rollup/plugin-yaml';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		uno(),
		yaml(),
		vueI18n({
			include: path.join(import.meta.dirname, './src/locales/*.yml'),
		}),
	],
});
