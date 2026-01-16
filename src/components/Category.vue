<script setup lang="ts">
import type { CategoryData } from "../lib/songData";
import Pack from "./Pack.vue";

const props = defineProps<{
  category: CategoryData;
}>();
</script>
<template>
  <section>
    <h2 class="category-header" un-m="x-auto" un-max-w="xl" un-font="en">
      {{ props.category.title }}
    </h2>
    <div un-m="x-auto" un-max-w="sm" un-p="x-4">
      <Pack v-for="(pack, index) in props.category.packs" :key="index" :pack />
    </div>
  </section>
</template>
<style scoped lang="scss">
section {
  .category-header {
    background: theme("colors.arcaea");
    text-align: center;
    color: white;
    font-weight: bold;
    height: 2rem;
    line-height: 2rem;
    clip-path: polygon(
      1rem 0,
      calc(100% - 1rem) 0,
      100% 50%,
      calc(100% - 1rem) 100%,
      1rem 100%,
      0 50%
    );
  }
}
</style>
