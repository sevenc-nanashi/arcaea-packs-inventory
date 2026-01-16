<script setup lang="ts">
import Checkbox from './ui/Checkbox.vue';
import type { PackData } from '../lib/songData';
import { packItselfKey, usePacksStore } from '../store';
import { computed, ref } from 'vue';

const props = defineProps<{
	pack: PackData;
}>();

const packsStore = usePacksStore();
const setHasPack = (pack: string, has: boolean) => {
	packsStore.setHasPack(props.pack.textId, pack, has);
};
const getHasPack = (pack: string) => {
	return packsStore.hasPack(props.pack.textId, pack);
};

const hasAllPack = computed(() => {
	if (!getHasPack(packItselfKey)) {
		return false;
	}
	for (const append of props.pack.appends) {
		if (!getHasPack(append.textId)) {
			return false;
		}
	}
	return true;
});

const setHasAllPack = () => {
	if (hasAllPack.value) {
		// uncheck all
		setHasPack(packItselfKey, false);
		for (const append of props.pack.appends) {
			setHasPack(append.textId, false);
		}
	} else {
		// check all
		setHasPack(packItselfKey, true);
		for (const append of props.pack.appends) {
			setHasPack(append.textId, true);
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
				:un-color="hasAllPack ? 'pure' : 'far'"
				:modelValue="getHasPack(packItselfKey)"
				@shiftCheck="setHasAllPack"
				@update:modelValue="setHasPack(packItselfKey, $event)"
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
					<Checkbox un-color="far" :modelValue="getHasPack(append.textId)" @update:modelValue="setHasPack(append.textId, $event)" />
					{{ append.title }}
				</label>
			</div>
		</div>
	</details>
	<label v-else un-flex un-items="center" un-gap="2" class="pack-heading" un-cursor="pointer">
		<Checkbox
			un-color="far"
			:modelValue="getHasPack(packItselfKey)"
			@shiftCheck="setHasPack(packItselfKey, !getHasPack(packItselfKey))"
			@update:modelValue="setHasPack(packItselfKey, $event)"
		/>
		<span>{{ props.pack.title }}</span>
	</label>
</template>

<style scoped></style>
