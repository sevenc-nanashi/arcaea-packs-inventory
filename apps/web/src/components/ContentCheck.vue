<script setup lang="ts">
import Checkbox from "./ui/Checkbox.vue";
import type { AppendData, LockedSongData, PackData } from "@shared/song-data";
import { useUnlockableContentsStore } from "../store";

const props = defineProps<{
  content: PackData | AppendData | LockedSongData;
  kind?: "pack" | "song";
}>();

const unlockableContentsStore = useUnlockableContentsStore();
const setHasPack = (has: boolean) => {
  if (props.kind === "song") {
    unlockableContentsStore.setHasSong(props.content.textId, has);
  } else {
    unlockableContentsStore.setHasPack(props.content.textId, has);
  }
};
const getHasPack = () => {
  if (props.kind === "song") {
    return unlockableContentsStore.hasSong(props.content.textId);
  }
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
