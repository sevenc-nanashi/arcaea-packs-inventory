import { defineStore } from 'pinia';
import { categoriesData } from './lib/songData';

export const packItselfKey = '_itself';

export const usePacksStore = defineStore('packs', {
	state: () => {
		const inventory = new Map();
		for (const category of categoriesData) {
			inventory.set(`${category.textId}.${packItselfKey}`, false);
			for (const pack of category.packs) {
				inventory.set(`${category.textId}.${pack.textId}`, false);
			}
		}
		return {
			inventory,
		};
	},
	actions: {
		hasPack(categoryId: string, packId: string) {
			return this.inventory.get(`${categoryId}.${packId}`) ?? false;
		},
		setHasPack(categoryId: string, packId: string, value: boolean) {
			this.inventory.set(`${categoryId}.${packId}`, value);
		},
	},
});
