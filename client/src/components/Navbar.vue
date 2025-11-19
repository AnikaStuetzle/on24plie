<template>
  <nav class="navbar" v-if="auth.isLoggedIn">
    <router-link to="/exercises" class="navlink" active-class="active"
      >Übungen</router-link
    >
    <router-link to="/sessions" class="navlink" active-class="active"
      >Training</router-link
    >
    <router-link to="/progress" class="navlink" active-class="active"
      >Fortschritt</router-link
    >
    <router-link to="/lexicon" class="navlink" active-class="active"
      >Lexikon</router-link
    >
    <a href="#" @click.prevent="logout" class="navlink logout">Logout</a>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push("/login");
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 40px auto 24px auto;
  padding: 16px 40px;
  max-width: 900px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 8px 32px rgba(180, 140, 140, 0.14);
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 10;
}

.navlink {
  padding: 9px 20px;
  border-radius: 16px;
  font-size: 1.09em;
  letter-spacing: 0.7px;
  color: #5d2246;
  background: rgba(240, 225, 225, 0.22);
  box-shadow: 0 2px 10px rgba(192, 140, 160, 0.08);
  text-decoration: none;
  font-weight: 500;
  transition: background 0.22s, color 0.18s, box-shadow 0.25s;
}

.navlink:hover,
.navlink.active {
  background: linear-gradient(90deg, #d5b8c2 35%, #e7c3c7 100%);
  color: #a74c82;
  box-shadow: 0 2px 16px rgba(170, 110, 140, 0.2);
}

.logout {
  background: rgba(255, 215, 215, 0.18);
  color: #ba2246;
  font-weight: 600;
  border: none;
}

.logout:hover {
  background: linear-gradient(90deg, #f4c7d0 0%, #f9dadc 100%);
  color: #cb2250;
  box-shadow: 0 2px 16px rgba(230, 110, 140, 0.11);
}
</style>
