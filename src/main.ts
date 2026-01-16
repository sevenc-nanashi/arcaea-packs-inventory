import '@fontsource/exo/400.css';
import '@fontsource/exo/700.css';
import { createPinia } from 'pinia';
import 'virtual:uno.css';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import './style.css';

import en from './locales/en.yml';
import ja from './locales/ja.yml';

const getInitialLocale = () => {
	if (typeof window === 'undefined') {
		return 'en';
	}
	const savedLocale = localStorage.getItem('preferredLocale');
	if (savedLocale) {
		return savedLocale;
	}
	return navigator.language.split('-')[0];
};

const i18n = createI18n({
	locale: getInitialLocale(),
	fallbackLocale: 'en',
	messages: {
		en,
		ja,
	},
});
const pinia = createPinia();
createApp(App).use(i18n).use(pinia).mount('#app');
