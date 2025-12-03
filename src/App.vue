<script setup lang="ts">

</script>

<template>
	<Header />
	<Export />
	<main un-p="4">
		<Category v-for="category in categoriesData" :key="category.textId" :category="category" />
	</main>
</template>

<style scoped></style>
