<script setup lang="ts">
import Checkbox from './ui/Checkbox.vue';
import type { PackData } from '../lib/songData';
import { packItselfKey, useUnlockableContentsStore } from '../store';
import { computed, ref } from 'vue';

const props = defineProps<{
	pack: PackData;
}>();

const unlockableContentsStore = useUnlockableContentsStore();
const setHasUnlockableContent = (unlockableContent: string, has: boolean) => {
	unlockableContentsStore.setHasUnlockableContent(props.pack.textId, unlockableContent, has);
};
const getHasUnlockableContent = (unlockableContent: string) => {
	return unlockableContentsStore.hasUnlockableContent(props.pack.textId, unlockableContent);
};

const hasAllUnlockableContent = computed(() => {
	if (!getHasUnlockableContent(packItselfKey)) {
		return false;
	}
	for (const append of props.pack.appends) {
		if (!getHasUnlockableContent(append.textId)) {
			return false;
		}
	}
	return true;
});

const setHasAllUnlockableContent = () => {
	if (hasAllUnlockableContent.value) {
		// uncheck all
		setHasUnlockableContent(packItselfKey, false);
		for (const append of props.pack.appends) {
			setHasUnlockableContent(append.textId, false);
		}
	} else {
		// check all
		setHasUnlockableContent(packItselfKey, true);
		for (const append of props.pack.appends) {
			setHasUnlockableContent(append.textId, true);
		}
	}
};

const hasAppends = computed(() => props.pack.appends.length > 0);
const isAppendsOpen = ref(false);
</script>

<template>
	<details v-if="hasAppends" @toggle="isAppendsOpen = ($event.target as HTMLDetailsElement).open">
		<summary un-flex un-items="center" un-gap="2" class="pack-heading" un-cursor="pointer">
			<Checkbox
				:un-color="hasAllUnlockableContent ? 'pure' : 'far'"
				:modelValue="getHasUnlockableContent(packItselfKey)"
				@shiftCheck="setHasAllUnlockableContent"
				@update:modelValue="setHasUnlockableContent(packItselfKey, $event)"
			/>
			<span>{{ props.pack.title }}</span>
			<div un-flex="grow" />
			<span
				v-if="hasAppends"
				un-text="sm slate-500"
				un-size="4"
				:un-i="isAppendsOpen ? 'fluent-chevron-up-32-filled' : 'fluent-chevron-down-32-filled'"
			/>
		</summary>
		<div v-if="hasAppends" un-ml="6">
			<div v-for="append in props.pack.appends">
				<label un-flex un-items="center" un-gap="2" un-cursor="pointer">
					<Checkbox un-color="far" :modelValue="getHasUnlockableContent(append.textId)" @update:modelValue="setHasUnlockableContent(append.textId, $event)" />
					{{ append.title }}
				</label>
			</div>
		</div>
	</details>
	<label v-else un-flex un-items="center" un-gap="2" class="pack-heading" un-cursor="pointer">
		<Checkbox
			un-color="far"
			:modelValue="getHasUnlockableContent(packItselfKey)"
			@shiftCheck="setHasUnlockableContent(packItselfKey, !getHasUnlockableContent(packItselfKey))"
			@update:modelValue="setHasUnlockableContent(packItselfKey, $event)"
		/>
		<span>{{ props.pack.title }}</span>
	</label>
</template>

<style scoped></style>
