<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Passwort" />
      <button>Login</button>
      <p v-if="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth"; // relativer Import

const username = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();
const auth = useAuthStore();

const login = async () => {
  error.value = "";
  try {
    const res = await fetch("http://localhost:8010/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      auth.setUser({ username: username.value });
      router.push("/exercises");
    } else {
      error.value = data.message || "Login fehlgeschlagen.";
    }
  } catch (e) {
    error.value = "Netzwerkfehler: " + e;
  }
};
</script>

<style scoped>
.login-container {
  max-width: 340px;
  margin: 80px auto 0 auto;
  padding: 32px 28px 24px 28px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(180, 140, 140, 0.16);
  backdrop-filter: blur(12px);
  text-align: center;
}

.login-container h2 {
  margin-bottom: 18px;
  font-weight: 500;
  letter-spacing: 1px;
}

.login-container form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-container input {
  padding: 10px 14px;
  font-size: 1rem;
  border: none;
  border-radius: 14px;
  background: rgba(240, 225, 225, 0.4);
  box-shadow: 0 1px 8px rgba(180, 140, 140, 0.13);
  transition: background 0.2s;
}

.login-container input:focus {
  outline: none;
  background: rgba(250, 210, 220, 0.44);
}

.login-container button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 14px;
  border: none;
  background: linear-gradient(90deg, #d5b8c2 35%, #e7c3c7 100%);
  color: #5d2246;
  font-weight: 500;
  box-shadow: 0 1px 8px rgba(192, 140, 160, 0.17);
  cursor: pointer;
  margin-top: 7px;
  transition: background 0.28s;
}

.login-container button:hover {
  background: linear-gradient(90deg, #e7c3c7 0%, #d5b8c2 100%);
}

.login-container p {
  color: #b35c6a;
  font-size: 0.95em;
  margin-top: 2px;
}
</style>
