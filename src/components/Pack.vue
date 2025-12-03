<script setup lang="ts">
const _props = defineProps<{
  name: string;
}>();
</script>

<template>
	<div>
		{{ props.name }}
	</div>
</template>
