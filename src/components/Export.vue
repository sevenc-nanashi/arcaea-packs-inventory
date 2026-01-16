<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Badge from './Badge.vue';

const { t } = useI18n();
</script>

<template>
	<button un-fixed un-right="2" un-bottom="2" un-drop-shadow="md">
		<Badge un-bg="arcaea hover:pure" un-text="white" un-cursor="pointer" un-p="x-6">{{ t('exportButton') }}</Badge>
	</button>
</template>
