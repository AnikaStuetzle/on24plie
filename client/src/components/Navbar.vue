<template>
  <nav v-if="auth.isLoggedIn">
    <router-link to="/exercises">Übungen</router-link>
    <router-link to="/workouts">Workouts</router-link>
    <router-link to="/sessions">Training</router-link>
    <router-link to="/progress">Fortschritt</router-link>
    <router-link to="/lexicon">Lexikon</router-link>
    <router-link to="/account">Account</router-link>
    <a href="#" @click.prevent="logout">Logout</a>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth.js";
import { useRouter } from "vue-router";

const isLoggedIn = computed(() => {
  return !!localStorage.getItem("user");
});

const auth = useAuthStore();

const router = useRouter();

function logout() {
  auth.logout();
  router.push("/login");
}
</script>
