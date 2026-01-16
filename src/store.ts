import { defineStore } from 'pinia';
import { categoriesData } from './lib/songData';

export const packItselfKey = '_itself';
export const beyondKey = (name: string) => `${name}__beyond`;
const separator = '__';

export const useUnlockableContentsStore = defineStore('unlockableContents', {
	state: () => {
		const inventory = new Map();
		for (const category of categoriesData) {
			for (const unlockableContent of category.packs) {
				inventory.set(['pack', unlockableContent.textId].join(separator), false);
				for (const append of unlockableContent.appends) {
					inventory.set(['pack', append.textId].join(separator), false);
				}
			}
		}
		return {
			inventory,
		};
	},
	actions: {
		hasPack(packId: string) {
			const maybeValue = this.inventory.get(['pack', packId].join(separator));
			if (maybeValue === undefined) {
				throw new Error(`Unknown pack: ${packId}`);
			}
			return maybeValue;
		},
		setHasPack(packId: string, value: boolean) {
			this.inventory.set(['pack', packId].join(separator), value);
		},
	},
});
