<script setup lang="ts">
import Checkbox from './ui/Checkbox.vue';
import type { AppendData, PackData } from '../lib/songData';
import { packItselfKey, useUnlockableContentsStore } from '../store';
import { computed, ref } from 'vue';
import ContentCheck from './ContentCheck.vue';

const props = defineProps<{
	pack: PackData;
	append?: AppendData;
}>();

const unlockableContentsStore = useUnlockableContentsStore();
const setHasPack = (has: boolean) => {
	unlockableContentsStore.setHasPack(props.pack.textId, has);
};
const getHasPack = () => {
	return unlockableContentsStore.hasPack(props.pack.textId);
};

const hasAllUnlockableContent = computed(() => {
	if (!getHasPack()) {
		return false;
	}
	for (const append of props.pack.appends) {
		if (!unlockableContentsStore.hasPack(append.textId)) {
			return false;
		}
	}
	return true;
});

const setHasAllPacks = (value: boolean) => {
	if (value) {
		// check all
		setHasPack(true);
		for (const append of props.pack.appends) {
			unlockableContentsStore.setHasPack(append.textId, true);
		}
	} else {
		// uncheck all
		setHasPack(false);
		for (const append of props.pack.appends) {
			unlockableContentsStore.setHasPack(append.textId, false);
		}
	}
};

const appends = computed(() => (props.append ? [] : props.pack.appends));
const isAppendsOpen = ref(false);
</script>

<template>
	<details v-if="appends.length > 0" @toggle="isAppendsOpen = ($event.target as HTMLDetailsElement).open">
		<summary un-flex un-items="center" un-gap="2" class="pack-heading" un-cursor="pointer" un-font="en">
			<Checkbox
				:un-color="hasAllUnlockableContent ? 'pure' : 'far'"
				:modelValue="getHasPack()"
				@update:modelValue="setHasAllPacks($event)"
			/>
			<span>{{ props.append?.title ?? props.pack.title }}</span>
			<div un-flex="grow" />
			<span un-text="sm slate-500" un-size="4" :un-i="isAppendsOpen ? 'fluent-chevron-up-32-filled' : 'fluent-chevron-down-32-filled'" />
		</summary>
		<div un-ml="6">
			<ContentCheck :content="props.pack" un-font="en" />
			<ContentCheck v-for="(append, index) in props.pack.appends" :key="index" :content="append" un-font="en" />
		</div>
	</details>
	<label v-else un-flex un-items="center" un-gap="2" class="pack-heading" un-cursor="pointer" un-font="en">
		<Checkbox un-color="pure" :modelValue="getHasPack()" @update:modelValue="setHasPack($event)" />
		<span>{{ props.append?.title ?? props.pack.title }}</span>
	</label>
</template>

<style scoped></style>
