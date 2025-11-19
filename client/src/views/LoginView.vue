<template>
  <div class="login-container">
    <h2>{{ isRegisterMode ? "Registrieren" : "Login" }}</h2>

    <form @submit.prevent="onSubmit">
      <input
        v-model="username"
        placeholder="Username"
        autocomplete="username"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Passwort"
        autocomplete="current-password"
      />

      <button type="submit">
        {{ isRegisterMode ? "Account erstellen" : "Einloggen" }}
      </button>

      <p v-if="error">{{ error }}</p>
    </form>

    <button class="toggle" @click="toggleMode">
      <span v-if="isRegisterMode">
        Du hast schon einen Account? Hier einloggen
      </span>
      <span v-else> Noch kein Account? Hier registrieren </span>
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const username = ref("");
const password = ref("");
const error = ref("");
const isRegisterMode = ref(false);

const router = useRouter();
const authStore = useAuthStore();

const onSubmit = async () => {
  error.value = "";

  if (!username.value || !password.value) {
    error.value = "Bitte Username und Passwort eingeben";
    return;
  }

  try {
    if (isRegisterMode.value) {
      await authStore.register(username.value, password.value);
    } else {
      await authStore.login(username.value, password.value);
    }

    // Weiterleitung nach erfolgreichem Login oder Registrierung
    router.push("/progress");
  } catch (err) {
    error.value = err.message || "Etwas ist schiefgelaufen";
  }
};

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
  error.value = "";
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
  padding: 25px;
  border-radius: 12px;
  background: #f9f4f6;
  box-shadow: 0 0 18px rgba(186, 152, 165, 0.35);
  max-width: 340px;
  margin-left: auto;
  margin-right: auto;
}

.login-container h2 {
  margin-bottom: 15px;
  color: #4b2d3a;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.login-container form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.login-container input {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #d9c2cf;
  font-size: 14px;
  background: #fff;
}

.login-container button[type="submit"] {
  padding: 9px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: linear-gradient(90deg, #f2c2d1 0%, #e3b9cf 100%);
  color: #442533;
  font-weight: 600;
  margin-top: 7px;
  transition: background 0.28s;
}

.login-container button[type="submit"]:hover {
  background: linear-gradient(90deg, #e7c3c7 0%, #d5b8c2 100%);
}

.login-container p {
  color: #b35c6a;
  font-size: 0.95em;
  margin-top: 2px;
}

.toggle {
  margin-top: 10px;
  border: none;
  background: none;
  color: #6b4a5b;
  font-size: 0.9em;
  cursor: pointer;
  text-decoration: underline;
}
</style>
