<script setup lang="ts">
import Header from './components/Header.vue';
import Export from './components/Export.vue';
import Category from './components/Category.vue';
import { categoriesData } from './lib/songData';
import { useUnlockableContentsStore } from './store';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
const i18n = useI18n();
const unlockableContentsStore = useUnlockableContentsStore();

if (typeof window !== 'undefined') {
	const hash = window.location.hash.slice(1);
	if (hash) {
		unlockableContentsStore.hydrate(hash);
	}
}

watch(
	() => i18n.locale.value,
	(newLocale) => {
		if (typeof window === 'undefined') {
			return;
		}
		document.documentElement.lang = newLocale;
		localStorage.setItem('preferredLocale', newLocale);
	},
	{ immediate: true },
);
</script>

<template>
	<Header />
	<Export />
	<main un-p="4">
		<Category v-for="category in categoriesData" :key="category.textId" :category="category" />
	</main>
</template>

<style scoped lang="scss"></style>
