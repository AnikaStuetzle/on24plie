<template>
  <div class="page">
    <h1>Statistik</h1>

    <div v-if="loading" class="info">Lade Statistiken...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <section class="grid">
        <div class="card">
          <h2>Trainings dieses Jahr</h2>
          <p class="big">{{ progress.totalSessionsYear }}</p>
          <p class="hint">
            {{ progress.currentYear }}
          </p>
        </div>

        <div class="card">
          <h2>Stunden dieses Jahr</h2>
          <p class="big">{{ progress.totalHoursYear.toFixed(1) }}</p>
          <p class="hint">({{ progress.totalMinutesYear }} Minuten)</p>
        </div>

        <div class="card">
          <h2>Durchschnittliche Dauer</h2>
          <p class="big">{{ progress.avgDurationYear.toFixed(1) }} Min</p>
          <p class="hint">pro Training in {{ progress.currentYear }}</p>
        </div>

        <div class="card">
          <h2>Dieser Monat</h2>
          <p class="big">{{ progress.sessionsThisMonth }}x trainiert</p>
          <p class="hint">~ {{ progress.hoursThisMonth.toFixed(1) }} Stunden</p>
        </div>

        <div class="card">
          <h2>Gesamt bisher</h2>
          <p class="big">{{ progress.totalHoursAll.toFixed(1) }} Stunden</p>
          <p class="hint">seit du Sessions trackst</p>
        </div>

        <div class="card">
          <h2>Intensive Trainings</h2>
          <p class="big">{{ progress.highIntensitySessionsYear }}</p>
          <p class="hint">
            mit Anstrengung ≥ 4 in {{ progress.currentYear }}<br />
            Durchschnittliche Anstrengung:
            {{ progress.avgIntensityYear.toFixed(1) }}/5
          </p>
        </div>
      </section>

      <section class="recent">
        <h2>Letzte Trainings</h2>
        <p v-if="progress.recentSessions.length === 0" class="info">
          Noch keine Trainings eingetragen.
        </p>
        <ul v-else class="list">
          <li v-for="s in progress.recentSessions" :key="s.id" class="entry">
            <div>
              <div class="entry-date">{{ formatDate(s.date) }}</div>
              <div class="entry-meta">
                {{ s.duration }} Min • Anstrengung: {{ s.intensity }}/5
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const loading = ref(false);
const error = ref("");
const progress = ref({
  currentYear: new Date().getFullYear(),
  totalMinutesYear: 0,
  totalHoursYear: 0,
  totalSessionsYear: 0,
  avgDurationYear: 0,
  totalMinutesAll: 0,
  totalHoursAll: 0,
  sessionsThisMonth: 0,
  minutesThisMonth: 0,
  hoursThisMonth: 0,
  highIntensitySessionsYear: 0,
  avgIntensityYear: 0,
  recentSessions: [],
});

const fetchProgress = async () => {
  loading.value = true;
  error.value = "";

  try {
    const res = await fetch("/api/progress");
    if (!res.ok) throw new Error("Konnte Fortschritt nicht laden");
    const data = await res.json();
    progress.value = data;
  } catch (err) {
    console.error(err);
    error.value = err.message || "Fehler beim Laden des Fortschritts";
  } finally {
    loading.value = false;
  }
};

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("de-DE");
  } catch {
    return value;
  }
};

onMounted(() => {
  fetchProgress();
});
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 40px auto 0;
  padding: 24px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 18px;
  color: #3d2431;
  letter-spacing: 0.04em;
}

/* Infos & Fehler */

.info {
  color: #7d6774;
  font-size: 0.95rem;
}

.error {
  color: #b33;
}

/* Karten Grid */

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px;
  margin-bottom: 26px;
}

.card {
  border-radius: 18px;
  border: 1px solid #ebdde5;
  background: radial-gradient(
    circle at top left,
    #fff7fb 0,
    #ffffff 45%,
    #fdf7fb 100%
  );
  padding: 16px 18px;
  box-shadow: 0 4px 18px rgba(172, 136, 151, 0.22);
  position: relative;
  overflow: hidden;
}

.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.6);
  pointer-events: none;
}

.card h2 {
  margin: 0 0 6px;
  font-size: 1rem;
  color: #4a2a3a;
}

.big {
  font-size: 2rem;
  font-weight: 700;
  color: #3b2030;
  margin: 2px 0 4px;
}

.hint {
  font-size: 0.85rem;
  color: #7b6473;
}

/* Letzte Trainings */

.recent h2 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #3f2633;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.entry {
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid #ebdde5;
  background: #ffffff;
  margin-bottom: 8px;
  box-shadow: 0 2px 10px rgba(160, 130, 145, 0.2);
}

.entry-date {
  font-weight: 600;
  color: #402533;
}

.entry-meta {
  font-size: 0.9rem;
  color: #6b5664;
}

/* responsiv */

@media (max-width: 640px) {
  .page {
    padding: 16px;
    margin-top: 20px;
  }

  .big {
    font-size: 1.6rem;
  }
}
</style>
