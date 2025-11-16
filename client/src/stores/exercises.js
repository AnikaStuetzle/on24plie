import { defineStore } from "pinia";
export const useExercisesStore = defineStore("exercises", {
	state: () => ({
		exercises: [],
	}),
	actions: {
		async fetchExercises() {
			// API-Call folgt später
		},
	},
});
