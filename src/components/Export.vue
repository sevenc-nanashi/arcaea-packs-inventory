<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Badge from './Badge.vue';
import { useUnlockableContentsStore } from '../store';

const { t } = useI18n();
const dialogRef = ref<HTMLDialogElement | null>(null);
const unlockableContentsStore = useUnlockableContentsStore();

const exportUrl = computed(() => {
	if (typeof window === 'undefined') {
		return '';
	}
	const base = window.location.href.split('#')[0];
	return `${base}#${unlockableContentsStore.export()}`;
});

const openDialog = () => dialogRef.value?.showModal();
const closeDialog = () => dialogRef.value?.close();

const copyExportLink = async () => {
	if (!exportUrl.value || typeof navigator === 'undefined' || !navigator.clipboard) {
		return;
	}
	try {
		await navigator.clipboard.writeText(exportUrl.value);
	} catch (error) {
		console.error('Copy failed', error);
	}
};
</script>

<template>
	<button
		un-fixed
		un-right="2"
		un-bottom="2"
		un-drop-shadow="md"
		type="button"
		@click="openDialog"
	>
		<Badge un-bg="arcaea hover:pure" un-text="white" un-cursor="pointer" un-p="x-6">{{ t('exportButton') }}</Badge>
	</button>
	<dialog ref="dialogRef" class="export-dialog" @click.self="closeDialog">
		<div class="export-dialog__body">
			<header>
				<h3>{{ t('exportDialogTitle') }}</h3>
				<p>{{ t('exportDialogDescription') }}</p>
			</header>
			<div class="export-dialog__link">
				<input type="text" readonly :value="exportUrl" />
				<button type="button" @click="copyExportLink">{{ t('exportDialogCopy') }}</button>
			</div>
			<div class="export-dialog__actions">
				<button type="button" @click="closeDialog">{{ t('exportDialogClose') }}</button>
			</div>
		</div>
	</dialog>
</template>

<style scoped>
.export-dialog {
	border: none;
	padding: 0;
	border-radius: 1rem;
	box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.5);
	max-width: min(90vw, 32rem);
	width: 100%;
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
.export-dialog::backdrop {
	background: rgba(0, 0, 0, 0.4);
}
.export-dialog__body {
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	font-family: var(--font-sans);
}
.export-dialog__body header h3 {
	margin: 0;
	font-size: 1.125rem;
}
.export-dialog__body header p {
	margin: 0;
	font-size: 0.9rem;
	color: gray;
}
.export-dialog__link {
	display: flex;
	gap: 0.5rem;
}
.export-dialog__link input {
	flex: 1;
	padding: 0.5rem;
	border-radius: 0.5rem;
	border: 1px solid rgba(0, 0, 0, 0.2);
	font-family: inherit;
}
.export-dialog__link button {
	padding: 0.5rem 1rem;
	border-radius: 0.5rem;
	border: none;
	background: #1c1c1c;
	color: white;
	cursor: pointer;
	font-weight: bold;
}
.export-dialog__actions {
	display: flex;
	justify-content: flex-end;
}
.export-dialog__actions button {
	padding: 0.5rem 1rem;
	border-radius: 0.5rem;
	border: none;
	background: #e0e0e0;
	cursor: pointer;
	font-weight: bold;
}
</style>
