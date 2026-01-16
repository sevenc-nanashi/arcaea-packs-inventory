<script setup lang="ts">
import { useI18n } from "vue-i18n";

const i18n = useI18n();
const locales = i18n.availableLocales;
</script>
<template>
	<header un-p="4" un-bg="arcaea" un-text="white lg" un-font="en" un-flex un-items="center">
		<span un-font="bold en">Arcaea Packs Inventory</span>
		<div un-flex="grow" />
		<div un-gap-x="2" un-flex>
			<template v-for="(locale, i) in locales" :key="i">
				<span v-if="i > 0">/</span>
				<button :un-font="i18n.locale.value === locale ? 'bold' : ''" un-cursor="pointer" @click="i18n.locale.value = locale">
					{{ locale.toUpperCase() }}
				</button>
			</template>
		</div>
	</header>
</template>
