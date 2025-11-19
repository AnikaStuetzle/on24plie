// client/src/stores/authStore.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: JSON.parse(localStorage.getItem("user")) || null,
	}),

	getters: {
		isLoggedIn: (state) => !!state.user,
	},

	actions: {
		setUser(userData) {
			this.user = userData;
			localStorage.setItem("user", JSON.stringify(userData));
		},

		logout() {
			this.user = null;
			localStorage.removeItem("user");
		},

		async login(username, password) {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const text = await res.text();
			let data = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch {
				// kein gültiges JSON, einfach ignorieren
			}

			if (!res.ok) {
				console.error("Login Fehlerantwort:", text);
				throw new Error(data.message || text || "Login fehlgeschlagen");
			}

			this.setUser({ id: data.userId, username });
		},

		async register(username, password) {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const text = await res.text();
			let data = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch {
				// wieder: kein JSON, egal
			}

			if (!res.ok) {
				console.error("Register Fehlerantwort:", text);
				throw new Error(
					data.message || text || "Registrierung fehlgeschlagen",
				);
			}

			// wenn Registrierung geklappt hat → einloggen
			await this.login(username, password);
		},
	},
});
