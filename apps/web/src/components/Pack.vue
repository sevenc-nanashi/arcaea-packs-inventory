<script setup lang="ts">
import Checkbox from "./ui/Checkbox.vue";
import { individualPacks, type AppendData, type PackData } from "@arcaea-packs-inventory/song-data";
import { useUnlockableContentsStore } from "../store";
import { computed, ref, watchEffect } from "vue";
import ContentCheck from "./ContentCheck.vue";

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

const lockedSongs = computed(() => (props.append ? [] : props.pack.lockedSongs));

const hasAllUnlockableContent = computed(() => {
  if (!getHasPack()) {
    return false;
  }
  for (const append of props.pack.appends) {
    if (!unlockableContentsStore.hasPack(append.textId)) {
      return false;
    }
  }
  for (const song of lockedSongs.value) {
    if (!unlockableContentsStore.hasSong(song.textId)) {
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
    for (const song of lockedSongs.value) {
      unlockableContentsStore.setHasSong(song.textId, true);
    }
  } else {
    // uncheck all
    setHasPack(false);
    for (const append of props.pack.appends) {
      unlockableContentsStore.setHasPack(append.textId, false);
    }
    for (const song of lockedSongs.value) {
      unlockableContentsStore.setHasSong(song.textId, false);
    }
  }
};

const appends = computed(() => (props.append ? [] : props.pack.appends));
const hasSubItems = computed(() => appends.value.length > 0 || lockedSongs.value.length > 0);
const isAppendsOpen = ref(false);

const isIndividualSongPack = computed(() => individualPacks.includes(props.pack.textId));
watchEffect(() => {
  if (!isIndividualSongPack.value) {
    return;
  }
  if (lockedSongs.value.some((song) => unlockableContentsStore.hasSong(song.textId))) {
    // if at least one song is unlocked, mark the pack as unlocked
    setHasPack(true);
  } else {
    // if all songs are locked, mark the pack as locked
    setHasPack(false);
  }
});
</script>

<template>
  <details v-if="hasSubItems" @toggle="isAppendsOpen = ($event.target as HTMLDetailsElement).open">
    <summary
      un-flex
      un-items="center"
      un-gap="2"
      class="pack-heading"
      un-cursor="pointer"
      un-font="en"
    >
      <Checkbox
        :un-color="hasAllUnlockableContent ? 'pure' : 'far'"
        :modelValue="getHasPack()"
        @update:modelValue="setHasAllPacks($event)"
      />
      <span>{{ props.append?.title ?? props.pack.title }}</span>
      <div un-flex="grow" />
      <span
        un-text="sm slate-500"
        un-size="4"
        :un-i="isAppendsOpen ? 'fluent-chevron-up-32-filled' : 'fluent-chevron-down-32-filled'"
      />
    </summary>
    <div un-ml="6">
      <ContentCheck v-if="props.pack.appends.length > 0" :content="props.pack" un-font="en" />
      <ContentCheck
        v-for="(append, index) in props.pack.appends"
        :key="index"
        :content="append"
        un-font="en"
      />
      <ContentCheck v-for="(song, index) in lockedSongs" :key="index" :content="song" kind="song" />
    </div>
  </details>
  <label
    v-else
    un-flex
    un-items="center"
    un-gap="2"
    class="pack-heading"
    un-cursor="pointer"
    un-font="en"
  >
    <Checkbox un-color="pure" :modelValue="getHasPack()" @update:modelValue="setHasPack($event)" />
    <span>{{ props.append?.title ?? props.pack.title }}</span>
  </label>
</template>

<style scoped lang="scss"></style>
