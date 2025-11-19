<template>
  <header class="nav-wrapper">
    <nav class="navbar">
      <!-- Brand links -->
      <div class="brand">
        Plié <span class="brand-of">von</span>
        <span class="brand-name">
          {{ auth.user?.username }}
        </span>
      </div>

      <!-- Navigation in der Mitte -->
      <div class="nav-links">
        <RouterLink to="/exercises" class="nav-link" active-class="active">
          Choreographie
        </RouterLink>

        <RouterLink to="/sessions" class="nav-link" active-class="active">
          Training
        </RouterLink>

        <RouterLink to="/progress" class="nav-link" active-class="active">
          Statistik
        </RouterLink>

        <RouterLink to="/lexicon" class="nav-link" active-class="active">
          Lexikon
        </RouterLink>
      </div>

      <!-- Logout rechts -->
      <button class="logout" @click="handleLogout">Logout</button>
    </nav>
  </header>
</template>

<script setup>
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const router = useRouter();
const auth = useAuthStore();

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};
</script>

<style scoped>
.nav-wrapper {
  padding: 18px 40px 8px;
}

/* Die weiße Kapsel */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 999px;
  box-shadow: 0 8px 32px rgba(170, 130, 145, 0.2);
  padding: 10px 18px;
}

/* Brand links */

.brand {
  font-weight: 700;
  font-size: 1rem;
  color: #3d2431;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.brand-of {
  font-weight: 400;
  margin: 0 4px;
}

.brand-name {
  color: #c45b86;
}

/* Links in der Mitte */

.nav-links {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex: 1;
}

.nav-link {
  padding: 6px 18px;
  border-radius: 999px;
  text-decoration: none;
  font-size: 0.9rem;
  color: #5c3c4c;
  background: transparent;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}

.nav-link.active {
  background: linear-gradient(90deg, #f2c2d1 0%, #e3b9cf 100%);
  color: #3c2230;
  box-shadow: 0 4px 14px rgba(200, 150, 170, 0.4);
}

.nav-link:hover {
  background: rgba(243, 216, 228, 0.6);
}

/* Logout rechts */

.logout {
  border: none;
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  background: #ffe4ea;
  color: #d13050;
  transition: background 0.15s ease, transform 0.1s ease;
}

.logout:hover {
  background: #ffd1dd;
  transform: translateY(-1px);
}

/* Responsive */

@media (max-width: 720px) {
  .nav-wrapper {
    padding: 12px 12px 4px;
  }

  .navbar {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .nav-links {
    justify-content: center;
    flex-wrap: wrap;
  }

  .logout {
    align-self: center;
  }
}
</style>
