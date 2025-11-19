<template>
  <div class="page">
    <h1>Training</h1>

    <div class="calendar-header">
      <button @click="prevMonth">‹</button>
      <div class="month-label">{{ monthName }} {{ currentYear }}</div>
      <button @click="nextMonth">›</button>
    </div>

    <div class="calendar">
      <div class="weekday" v-for="wd in weekdays" :key="wd">
        {{ wd }}
      </div>

      <div
        v-for="cell in calendarCells"
        :key="cell.key"
        class="day-cell"
        :class="{
          'other-month': !cell.inCurrentMonth,
          today: cell.isToday,
          'has-session': cell.hasSession,
        }"
        @click="cell.inCurrentMonth && openForDate(cell.dateStr)"
      >
        <span class="day-number">{{ cell.dayNumber }}</span>
        <span v-if="cell.hasSession" class="dot"></span>
      </div>
    </div>

    <section class="recent">
      <h2>Letzte Trainings</h2>
      <p v-if="sessions.length === 0" class="empty">
        Noch keine Trainings eingetragen.
      </p>
      <ul v-else class="list">
        <li v-for="session in sortedSessions" :key="session.id" class="entry">
          <div>
            <div class="entry-date">
              {{ formatDate(session.date) }}
            </div>
            <div class="entry-meta">
              {{ session.duration }} Min • Anstrengung:
              <span class="intensity"> {{ session.intensity }}/5 </span>
            </div>
            <div v-if="session.notes" class="entry-notes">
              {{ session.notes }}
            </div>
          </div>
          <button @click="openForDate(session.date)">Bearbeiten</button>
        </li>
      </ul>
    </section>

    <!-- Pop Up -->
    <div v-if="showDialog" class="dialog-backdrop">
      <div class="dialog">
        <h2>Training am {{ formatDate(form.date) }}</h2>

        <div class="field">
          <label>Dauer (in Minuten)</label>
          <input
            v-model.number="form.duration"
            type="number"
            min="0"
            placeholder="z.B. 60"
          />
        </div>

        <div class="field">
          <label>Was habt ihr gemacht?</label>
          <textarea
            v-model="form.notes"
            placeholder="z.B. Technik, Kondition, Choreo XY"
          ></textarea>
        </div>

        <div class="field">
          <label>Anstrengung</label>
          <div class="intensity-row">
            <input
              v-model.number="form.intensity"
              type="range"
              min="1"
              max="5"
            />
            <span class="intensity-label"> {{ form.intensity }} / 5 </span>
          </div>
          <div class="intensity-hints">
            <span>1 = entspannt</span>
            <span>5 = komplett zerstört</span>
          </div>
        </div>

        <p v-if="formError" class="error">{{ formError }}</p>

        <div class="dialog-actions">
          <button @click="saveSession">Speichern</button>
          <button @click="closeDialog">Abbrechen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const sessions = ref([]); // kommt jetzt vom Backend

const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth());

const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const showDialog = ref(false);
const formError = ref("");
const form = ref({
  date: "",
  duration: null,
  notes: "",
  intensity: 3,
});
const editingId = ref(null);

// Backend Daten holen
const fetchSessions = async () => {
  try {
    const res = await fetch("/api/sessions");
    if (!res.ok) throw new Error("Fehler beim Laden der Trainings");
    const data = await res.json();
    sessions.value = data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  fetchSessions();
});

// kleine Helfer

const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const toDateStr = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

const isSameDate = (dateStr, d) => {
  const [y, m, day] = dateStr.split("-").map(Number);
  return y === d.getFullYear() && m === d.getMonth() + 1 && day === d.getDate();
};

// Monat

const monthName = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1).toLocaleString("de-DE", {
    month: "long",
  })
);

// Kalenderzellen

const calendarCells = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;

  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  // Vormonat
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dateStr = toDateStr(
      month === 0 ? year - 1 : year,
      month === 0 ? 11 : month - 1,
      day
    );
    cells.push({
      key: `prev-${day}`,
      dayNumber: day,
      inCurrentMonth: false,
      dateStr,
      isToday: false,
      hasSession: sessions.value.some((s) => s.date === dateStr),
    });
  }

  // aktueller Monat
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = toDateStr(year, month, day);
    cells.push({
      key: `cur-${day}`,
      dayNumber: day,
      inCurrentMonth: true,
      dateStr,
      isToday: isSameDate(dateStr, today),
      hasSession: sessions.value.some((s) => s.date === dateStr),
    });
  }

  // nächster Monat auffüllen
  while (cells.length % 7 !== 0) {
    const day = cells.length - (startWeekday + daysInMonth) + 1;
    const dateStr = toDateStr(
      month === 11 ? year + 1 : year,
      month === 11 ? 0 : month + 1,
      day
    );
    cells.push({
      key: `next-${day}`,
      dayNumber: day,
      inCurrentMonth: false,
      dateStr,
      isToday: false,
      hasSession: sessions.value.some((s) => s.date === dateStr),
    });
  }

  return cells;
});

// sortierte Liste unten

const sortedSessions = computed(() =>
  [...sessions.value].sort((a, b) => (a.date < b.date ? 1 : -1))
);

// Monatswechsel

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value -= 1;
  } else {
    currentMonth.value -= 1;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value += 1;
  } else {
    currentMonth.value += 1;
  }
};

// Dialog

const openForDate = (dateStr) => {
  const existing = sessions.value.find((s) => s.date === dateStr);

  if (existing) {
    editingId.value = existing.id;
    form.value = {
      date: existing.date,
      duration: existing.duration,
      notes: existing.notes || "",
      intensity: existing.intensity ?? 3,
    };
  } else {
    editingId.value = null;
    form.value = {
      date: dateStr,
      duration: null,
      notes: "",
      intensity: 3,
    };
  }

  formError.value = "";
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

// Training speichern

const saveSession = async () => {
  if (!form.value.date) {
    formError.value = "Datum fehlt.";
    return;
  }
  if (!form.value.duration) {
    formError.value = "Bitte Dauer eintragen.";
    return;
  }

  try {
    if (editingId.value !== null) {
      // Update
      const res = await fetch(`/api/sessions/${editingId.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.value),
      });
      if (!res.ok) throw new Error("Fehler beim Aktualisieren");
    } else {
      // Neu
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.value),
      });
      if (!res.ok) throw new Error("Fehler beim Speichern");
    }

    await fetchSessions();
    showDialog.value = false;
  } catch (err) {
    console.error(err);
    formError.value = err.message || "Fehler beim Speichern";
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
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 40px auto 0;
  padding: 24px;
}

/* Titel */
h1 {
  font-size: 2rem;
  margin-bottom: 16px;
  color: #3d2431;
  letter-spacing: 0.04em;
}

/* Kalenderkopf */

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 10px;
}

.calendar-header button {
  border: none;
  border-radius: 999px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  background: #f3dde8;
  color: #4b3040;
  font-weight: 600;
}

.month-label {
  font-weight: 600;
  color: #4a2a3a;
}

/* Kalender Grid */

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  background: #f9f4f7;
  border-radius: 16px;
  padding: 10px;
  border: 1px solid #ebdde6;
  margin-bottom: 24px;
}

.weekday {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #7b5b6d;
  padding-bottom: 6px;
}

.day-cell {
  min-height: 60px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid transparent;
  padding: 4px 6px;
  cursor: pointer;
  position: relative;
  transition: background 0.15s ease, border-color 0.15s ease,
    transform 0.1s ease;
}

.day-cell:hover {
  background: #f3e0ee;
  border-color: #e1c2d4;
  transform: translateY(-1px);
}

.day-number {
  font-size: 0.85rem;
  color: #4a2a3a;
}

.other-month {
  opacity: 0.4;
}

.today {
  border-color: #f1b8d0;
  box-shadow: 0 0 0 1px rgba(240, 150, 195, 0.4);
}

.has-session {
  background: #fceff7;
}

.dot {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #e0678e;
}

/* Letzte Trainings Liste */

.recent h2 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #3f2633;
}

.empty {
  font-style: italic;
  color: #7d6774;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.entry {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #ebdde5;
  background: #fff;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(170, 135, 150, 0.15);
}

.entry-date {
  font-weight: 600;
  color: #402533;
}

.entry-meta {
  font-size: 0.9rem;
  color: #6b5664;
}

.intensity {
  font-weight: 600;
}

.entry-notes {
  margin-top: 4px;
  font-size: 0.9rem;
}

.entry button {
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid #d8c2cf;
  background: #fdf8fb;
  cursor: pointer;
  font-size: 0.8rem;
  color: #533243;
}

/* Dialog */

.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(40, 20, 30, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.dialog {
  background: #fefbfe;
  padding: 20px 22px 18px;
  border-radius: 16px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(40, 15, 25, 0.45);
  border: 1px solid #ead3e4;
}

.dialog h2 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1.2rem;
  color: #3d2431;
}

.field {
  margin-bottom: 10px;
}

.field label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.9rem;
  color: #5a3b4a;
}

.field input,
.field textarea {
  width: 100%;
  padding: 7px 9px;
  border-radius: 8px;
  border: 1px solid #d9c4d2;
  font-size: 0.95rem;
  background: #fff;
}

.field textarea {
  min-height: 70px;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #e1a9c8;
  box-shadow: 0 0 0 2px rgba(225, 169, 200, 0.35);
}

.intensity-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.intensity-label {
  font-size: 0.9rem;
  color: #5b3c4a;
}

.intensity-hints {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #7a6472;
  margin-top: 4px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.dialog-actions button {
  padding: 7px 14px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.dialog-actions button:first-child {
  background: linear-gradient(90deg, #f2c2d1 0%, #e3b9cf 100%);
  color: #442533;
  font-weight: 600;
}

.dialog-actions button:last-child {
  background: #f3e6f0;
  color: #5b4050;
}

.error {
  color: #b33;
  margin-top: 6px;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .page {
    padding: 16px;
    margin-top: 20px;
  }

  .entry {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
