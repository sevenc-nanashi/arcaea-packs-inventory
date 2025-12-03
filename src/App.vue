<script setup lang="ts">
import Export from './components/Export.vue';
import Header from './components/Header.vue';
import Pack from './components/Pack.vue';
</script>

<template>
	<Header />
	<Export />
	<main un-p="4">
		<Pack name="Luminous Sky" un-text="pure" />
		<Pack name="Vicious Labyrinth" un-text="far" />
		<Pack name="Eternal Core" />
	</main>
</template>

<style scoped>
</style>
