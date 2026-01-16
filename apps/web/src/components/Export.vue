<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from "vue";
import { useI18n } from "vue-i18n";
import Badge from "./Badge.vue";
import { useUnlockableContentsStore } from "../store";

const { t } = useI18n();
const dialogRef = ref<HTMLDialogElement | null>(null);
const unlockableContentsStore = useUnlockableContentsStore();
const userName = computed({
  get: () => unlockableContentsStore.userName,
  set: (value: string) => unlockableContentsStore.setUserName(value),
});
const copyStatus = ref<"idle" | "copied">("idle");
const copyButtonText = computed(() =>
  copyStatus.value === "copied" ? t("exportDialogCopied") : t("exportDialogCopy"),
);
let copyStatusResetTimer: ReturnType<typeof setTimeout> | null = null;

const exportSerialized = computed(() => unlockableContentsStore.export());
const exportUrl = computed(() => {
  if (typeof window === "undefined") {
    return "";
  }
  return `${window.location.origin}${window.location.pathname}?i=${exportSerialized.value}`;
});
const exportImageUrl = ref("");
let exportImageTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  exportSerialized,
  (value) => {
    if (typeof window === "undefined") {
      exportImageUrl.value = "";
      return;
    }
    if (exportImageTimer !== null) {
      clearTimeout(exportImageTimer);
    }
    exportImageTimer = setTimeout(() => {
      const serialized = encodeURIComponent(value);
      exportImageUrl.value = `${window.location.origin}/image?inventory=${serialized}`;
      exportImageTimer = null;
    }, 300);
  },
  { immediate: true },
);

const openDialog = () => dialogRef.value?.showModal();
const closeDialog = () => dialogRef.value?.close();

const copyExportLink = async () => {
  if (!exportUrl.value || typeof navigator === "undefined" || !navigator.clipboard) {
    return;
  }
  try {
    await navigator.clipboard.writeText(exportUrl.value);
    copyStatus.value = "copied";
    if (copyStatusResetTimer !== null) {
      clearTimeout(copyStatusResetTimer);
    }
    copyStatusResetTimer = setTimeout(() => {
      copyStatus.value = "idle";
      copyStatusResetTimer = null;
    }, 1500);
  } catch (error) {
    console.error("Copy failed", error);
  }
};
onBeforeUnmount(() => {
  if (copyStatusResetTimer !== null) {
    clearTimeout(copyStatusResetTimer);
    copyStatusResetTimer = null;
  }
  if (exportImageTimer !== null) {
    clearTimeout(exportImageTimer);
    exportImageTimer = null;
  }
});
</script>

<template>
	<button un-fixed un-right="2" un-bottom="2" un-drop-shadow="md" type="button" un-z="100" @click="openDialog">
		<Badge un-bg="arcaea hover:pure" un-text="white" un-cursor="pointer" un-p="x-6">{{
			t("exportButton")
			}}</Badge>
	</button>
	<dialog ref="dialogRef" class="export-dialog" @click.self="closeDialog">
		<div class="export-dialog__body">
			<header>
				<h3>{{ t("exportDialogTitle") }}</h3>
				<p>{{ t("exportDialogDescription") }}</p>
			</header>
			<div un-flex un-gap="2" un-items="center">
				<label un-min-w="22" un-text="slate-600">{{ t("exportDialogNameLabel") }}</label>
				<input v-model="userName" type="text" :placeholder="t('exportDialogNamePlaceholder')" un-flex-grow un-p="x-4"
					un-h="10" un-border="slate-300 2" un-rounded="md" />
			</div>
			<div un-flex un-gap="2">
				<input type="text" readonly :value="exportUrl" un-flex-grow un-p="x-4" un-h="10" un-border="slate-300 2"
					un-rounded="md" />
				<button type="button" @click="copyExportLink">
					<Badge :un-bg="copyStatus === 'idle' ? 'arcaea' : 'pure'" un-text="slate-700" un-cursor="pointer" un-p="x-6">
						{{ copyButtonText }}
					</Badge>
				</button>
			</div>
			<div v-if="exportImageUrl" un-flex un-justify="center">
				<img :src="exportImageUrl" alt="Inventory preview" width="1200" height="630" un-rounded="lg"
					un-border="slate-200 2" un-w="full" />
			</div>
			<div un-flex un-justify="end">
				<button type="button" @click="closeDialog">
					<Badge un-bg="slate-400 hover:slate-500" un-text="slate-700" un-cursor="pointer" un-p="x-6">
						{{ t("exportDialogClose") }}
					</Badge>
				</button>
			</div>
		</div>
	</dialog>
</template>

<style scoped lang="scss">
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

	&::backdrop {
		background: rgba(0, 0, 0, 0.4);
	}

	&__body {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-family: var(--font-sans);

		header {
			h3 {
				margin: 0;
				font-size: 1.125rem;
			}

			p {
				margin: 0;
				font-size: 0.9rem;
				color: gray;
			}
		}
	}
}
</style>
