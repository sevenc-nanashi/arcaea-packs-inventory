<script setup lang="ts">
import Checkbox from './ui/Checkbox.vue';
import type { PackData } from '../lib/songData';
import { packItselfKey, usePacksStore } from '../store';
import { computed } from 'vue';

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
</script>

<template>
	<div un-flex un-items="center" un-gap="2">
		<Checkbox
			:un-color="hasAllPack ? 'pure' : 'far'"
			:modelValue="getHasPack(packItselfKey)"
			@shiftCheck="setHasAllPack()"
			@update:modelValue="setHasPack(packItselfKey, $event)"
		/>
		{{ props.pack.title }}
	</div>
	<div un-ml="6">
		<div v-for="append in props.pack.appends">
			<div un-flex un-items="center" un-gap="2">
				<Checkbox un-color="far" :modelValue="getHasPack(append.textId)" @update:modelValue="setHasPack(append.textId, $event)" />
				{{ append.title }}
			</div>
		</div>
	</div>
</template>
