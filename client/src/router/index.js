import { createRouter, createWebHistory } from "vue-router";

import ExercisesView from "../views/ExercisesView.vue";
import SessionsView from "../views/SessionsView.vue";
import ProgressView from "../views/ProgressView.vue";
import LexiconView from "../views/LexiconView.vue";
import LoginView from "../views/LoginView.vue";

const routes = [
	{
		path: "/",
		redirect: "/exercises",
	},
	{
		path: "/exercises",
		name: "exercises",
		component: ExercisesView,
	},
	{
		path: "/sessions",
		name: "sessions",
		component: SessionsView,
	},
	{
		path: "/progress",
		name: "progress",
		component: ProgressView,
	},
	{
		path: "/lexicon",
		name: "lexicon",
		component: LexiconView,
	},
	{
		path: "/login",
		name: "login",
		component: LoginView,
	},
	{
		path: "/register",
		name: "register",
		component: LoginView,
	},
	{
		path: "/:pathMatch(.*)*",
		redirect: "/exercises",
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

router.beforeEach((to, from, next) => {
	const publicPages = ["/login", "/register"];
	const authRequired = !publicPages.includes(to.path);
	const user = localStorage.getItem("user");

	if (authRequired && !user) {
		return next("/login");
	}

	next();
});

export default router;
