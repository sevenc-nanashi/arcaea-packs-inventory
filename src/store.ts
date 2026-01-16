import { defineStore } from 'pinia';
import { categoriesData } from './lib/songData';

export const packItselfKey = '_itself';

export const useUnlockableContentsStore = defineStore('unlockableContents', {
	state: () => {
		const inventory = new Map();
		for (const category of categoriesData) {
			inventory.set(`${category.textId}.${packItselfKey}`, false);
			for (const unlockableContent of category.packs) {
				inventory.set(`${category.textId}.${unlockableContent.textId}`, false);
			}
		}
		return {
			inventory,
		};
	},
	actions: {
		hasUnlockableContent(categoryId: string, unlockableContentId: string) {
			return this.inventory.get(`${categoryId}.${unlockableContentId}`) ?? false;
		},
		setHasUnlockableContent(categoryId: string, unlockableContentId: string, value: boolean) {
			this.inventory.set(`${categoryId}.${unlockableContentId}`, value);
		},
	},
});
