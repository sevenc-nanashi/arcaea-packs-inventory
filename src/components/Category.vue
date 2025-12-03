<script setup lang="ts">
import type { CategoryData } from "../lib/songData";

const _props = defineProps<{
  category: CategoryData;
}>();
</script>
<template>
	<h2 class="category-header">
		{{ props.category.title }}
	</h2>
</template>
<style scoped>
.category-header {
	background: theme('colors.arcaea');
	text-align: center;
	color: white;
	font-weight: bold;
	height: 2rem;
	line-height: 2rem;
	clip-path: polygon(1rem 0, calc(100% - 1rem) 0, 100% 50%, calc(100% - 1rem) 100%, 1rem 100%, 0 50%);
}
</style>
