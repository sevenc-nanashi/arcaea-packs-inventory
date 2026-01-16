<script setup lang="ts">
import Header from './components/Header.vue';
import Export from './components/Export.vue';
import Category from './components/Category.vue';
import { categoriesData } from './lib/songData';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
const i18n = useI18n();

watch(
	() => i18n.locale.value,
	(newLocale) => {
		document.documentElement.lang = newLocale;
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

<style scoped></style>
