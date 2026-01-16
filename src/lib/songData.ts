import categories from '../../songs/categories.json';
import songs from '../../songs/songs.json';

type BaseSongData = {
	index: number;
	text_id: string;
	title: string;
	pack: string;
	pack_append: string | null;
	has_eternal: boolean;
	has_beyond: boolean;
};
type BaseCategoryData = {
	text_id: string;
	title: string;
	packs: {
		text_id: string;
		title: string;
		appends: {
			text_id: string;
			title: string;
		}[];
	}[];
};
export type CategoryData = {
	textId: string;
	title: string;
	packs: PackData[];
};
export type PackData = {
	textId: string;
	title: string;
	appends: AppendData[];
};
export type AppendData = {
	textId: string;
	title: string;
};

export type SongData = {
	index: number;
	textId: string;
	title: string;
	pack: string;
	packAppend?: string | null;
	hasEternal: boolean;
	hasBeyond: boolean;
};

export const songsData: SongData[] = songs.map((song: BaseSongData) => ({
	index: song.index,
	textId: song.text_id,
	title: song.title,
	pack: song.pack,
	packAppend: song.pack_append ?? undefined,
	hasEternal: song.has_eternal,
	hasBeyond: song.has_beyond,
}));
export const categoriesData: CategoryData[] = categories.map((category: BaseCategoryData) => ({
	textId: category.text_id,
	title: category.title,
	packs: category.packs.map((pack) => ({
		textId: pack.text_id,
		title: pack.title,
		appends: pack.appends.map((append) => ({
			textId: `${pack.text_id}__${append.text_id}`,
			title: append.title,
		})),
	})),
}));

export type PackKey = (typeof categories)[number]['text_id'];
