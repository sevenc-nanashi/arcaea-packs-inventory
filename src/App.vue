<script setup lang="ts">
import Header from './components/Header.vue';
import Export from './components/Export.vue';
import Category from './components/Category.vue';
import { categoriesData } from './lib/songData';
</script>

<template>
	<Header />
	<Export />
	<main un-p="4">
		<Category v-for="category in categoriesData" :key="category.textId" :category="category" />
	</main>
</template>

<style scoped></style>
