<script setup lang="ts">
import Header from "./components/Header.vue";
import Export from "./components/Export.vue";
import Category from "./components/Category.vue";
import { categoriesData } from "@arcaea-packs-inventory/song-data";
import { useUnlockableContentsStore } from "./store";
import { useI18n } from "vue-i18n";
import { watch } from "vue";
const i18n = useI18n();
const unlockableContentsStore = useUnlockableContentsStore();

if (typeof window !== "undefined") {
  const searchParams = new URLSearchParams(window.location.search);
  const importParam = searchParams.get("i");
  if (importParam) {
    unlockableContentsStore.hydrate(importParam);
  }
}

watch(
  () => i18n.locale.value,
  (newLocale) => {
    if (typeof window === "undefined") {
      return;
    }
    document.documentElement.lang = newLocale;
    localStorage.setItem("preferredLocale", newLocale);
  },
  { immediate: true },
);
</script>

<template>
  <Header />
  <Export />
  <main un-p="4">
    <Category v-for="category in categoriesData" :key="category.textId" :category="category" />
  </main>
  <div un-flex-grow />
  <footer
    un-p="4"
    un-text="xs center arcaea dark:slate-400"
    un-bg="slate-200 dark:slate-900"
    un-font="en"
  >
    &copy; 2026
    <a
      un-text="underline [#48b0d5]"
      href="https://sevenc7c.com"
      target="_blank"
      rel="noopener noreferrer"
      >Nanashi.</a
    >
    - Source code on
    <a
      un-text="arcaea dark:slate-300"
      un-decoration="underline"
      href="https://github.com/sevenc-nanashi/arcaea-packs-inventory"
      target="_blank"
      rel="noopener noreferrer"
      >sevenc-nanashi/arcaea-packs-inventory</a
    >
    <br />
    This project is not affiliated by Lowiro, and copyright of contents belong to Lowiro and respective owners.
  </footer>
</template>

<style scoped lang="scss"></style>
