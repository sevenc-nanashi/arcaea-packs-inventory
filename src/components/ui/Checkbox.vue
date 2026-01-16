<script setup lang="ts">
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui';

const value = defineModel<boolean>({ required: true });

const emit = defineEmits<{
	shiftCheck: [checked: boolean];
}>();
</script>
<template>
	<CheckboxRoot
		v-model="value"
		un-cursor="pointer"
		un-inline-block
		@click="
			if ($event.shiftKey) {
				emit('shiftCheck', !value);
			}
		"
	>
		<svg width="1rem" height="1rem" viewBox="-2 -2 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 0 L24 12 L12 24 L0 12 Z" un-stroke="slate-500" stroke-width="2" un-fill="white" stroke-linecap="square" />
			<CheckboxIndicator asChild>
				<path d="M12 4 L20 12 L12 20 L4 12 Z" fill="currentColor" />
			</CheckboxIndicator>
		</svg>
	</CheckboxRoot>
</template>
