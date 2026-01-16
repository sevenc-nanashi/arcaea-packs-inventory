<template>
  <div class="badge">
    <slot />
  </div>
</template>
<style scoped lang="scss">
.badge {
  --height: 2rem;
  text-align: center;
  font-weight: bold;
  height: var(--height);
  line-height: var(--height);
  clip-path: polygon(
    calc(0.5 * var(--height)) 0,
    calc(100% - 0.5 * var(--height)) 0,
    100% 50%,
    calc(100% - 0.5 * var(--height)) 100%,
    calc(0.5 * var(--height)) 100%,
    0 50%
  );
}
</style>
