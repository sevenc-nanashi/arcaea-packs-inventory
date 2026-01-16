<script setup lang="ts">
import Checkbox from './ui/Checkbox.vue';
import type { AppendData, PackData } from '../lib/songData';
import { useUnlockableContentsStore } from '../store';

const props = defineProps<{
	content: PackData | AppendData;
}>();

const unlockableContentsStore = useUnlockableContentsStore();
const setHasPack = (has: boolean) => {
	unlockableContentsStore.setHasPack(props.content.textId, has);
};
const getHasPack = () => {
	return unlockableContentsStore.hasPack(props.content.textId);
};
</script>

<template>
	<label un-flex un-items="center" un-gap="2" class="pack-heading" un-cursor="pointer">
		<Checkbox un-color="pure" :modelValue="getHasPack()" @update:modelValue="setHasPack($event)" />
		<span>{{ props.content.title }}</span>
	</label>
</template>

<style scoped lang="scss"></style>
