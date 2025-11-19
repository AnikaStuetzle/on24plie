<template>
  <div class="page">
    <h1>Choreografien</h1>

    <div class="toolbar">
      <button @click="openCreate">Neue Choreografie</button>
    </div>

    <div v-if="choreos.length === 0" class="empty">
      Noch keine Choreos eingetragen.
    </div>

    <ul v-else class="list">
      <li v-for="choreo in choreos" :key="choreo.id" class="card">
        <div class="card-main">
          <h2>{{ choreo.name }}</h2>
          <p class="meta">
            Schwierigkeitsgrad:
            <span class="badge">{{ choreo.difficulty }}</span>
            • Gelernt am:
            <strong>{{ formatDate(choreo.date) }}</strong>
          </p>
          <p v-if="choreo.notes">{{ choreo.notes }}</p>
        </div>
        <div class="card-actions">
          <button @click="editChoreo(choreo)">Bearbeiten</button>
          <button @click="deleteChoreo(choreo.id)">Löschen</button>
        </div>
      </li>
    </ul>

    <!-- Pop Up / Dialog -->
    <div v-if="showDialog" class="dialog-backdrop">
      <div class="dialog">
        <h2>
          {{ editingChoreo ? "Choreografie bearbeiten" : "Neue Choreografie" }}
        </h2>

        <div class="field">
          <label>Name / Titel</label>
          <input
            v-model="form.name"
            placeholder="z.B. TikTok Routine, Showtanz XY"
          />
        </div>

        <div class="field">
          <label>Schwierigkeitsgrad</label>
          <select v-model="form.difficulty">
            <option disabled value="">Bitte wählen</option>
            <option value="leicht">leicht</option>
            <option value="mittel">mittel</option>
            <option value="schwer">schwer</option>
          </select>
        </div>

        <div class="field">
          <label>Datum gelernt / gemacht</label>
          <input v-model="form.date" type="date" />
        </div>

        <div class="field">
          <label>Notizen (optional)</label>
          <textarea
            v-model="form.notes"
            placeholder="z.B. welche Gruppe, Musik, Besonderheiten"
          ></textarea>
        </div>

        <p v-if="formError" class="error">{{ formError }}</p>

        <div class="dialog-actions">
          <button @click="saveChoreo">Speichern</button>
          <button @click="closeDialog">Abbrechen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const choreos = ref([
  // Beispiel Eintrag, kannst du löschen
  // {
  //   id: 1,
  //   name: "Beispielchoreo",
  //   difficulty: "mittel",
  //   date: "2025-11-01",
  //   notes: "Nur zum Testen",
  // },
]);

const showDialog = ref(false);
const editingChoreo = ref(null);
const formError = ref("");

const form = ref({
  name: "",
  difficulty: "",
  date: "",
  notes: "",
});

const resetForm = () => {
  form.value = {
    name: "",
    difficulty: "",
    date: "",
    notes: "",
  };
  formError.value = "";
};

const openCreate = () => {
  editingChoreo.value = null;
  resetForm();
  showDialog.value = true;
};

const editChoreo = (choreo) => {
  editingChoreo.value = choreo;
  form.value = {
    name: choreo.name,
    difficulty: choreo.difficulty,
    date: choreo.date,
    notes: choreo.notes || "",
  };
  formError.value = "";
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const saveChoreo = () => {
  if (!form.value.name) {
    formError.value = "Name darf nicht leer sein";
    return;
  }
  if (!form.value.difficulty) {
    formError.value = "Bitte einen Schwierigkeitsgrad wählen";
    return;
  }
  if (!form.value.date) {
    formError.value = "Bitte ein Datum eintragen";
    return;
  }

  if (editingChoreo.value) {
    // Update
    const index = choreos.value.findIndex(
      (c) => c.id === editingChoreo.value.id
    );
    if (index !== -1) {
      choreos.value[index] = {
        ...choreos.value[index],
        ...form.value,
      };
    }
  } else {
    // Create
    const newId =
      choreos.value.length > 0
        ? Math.max(...choreos.value.map((c) => c.id)) + 1
        : 1;

    choreos.value.push({
      id: newId,
      ...form.value,
    });
  }

  showDialog.value = false;
};

const deleteChoreo = (id) => {
  if (!confirm("Choreografie wirklich löschen?")) return;
  choreos.value = choreos.value.filter((c) => c.id !== id);
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
  max-width: 900px;
  margin: 40px auto 0;
  padding: 24px;
}

/* Überschrift */

h1 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #3d2431;
  letter-spacing: 0.04em;
}

/* Toolbar oben rechts */

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 18px;
}

.toolbar button {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: linear-gradient(90deg, #f2c2d1 0%, #e3b9cf 100%);
  color: #442533;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 0 12px rgba(200, 150, 170, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.toolbar button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(200, 150, 170, 0.45);
  opacity: 0.95;
}

/* Leerer Zustand */

.empty {
  margin-top: 30px;
  padding: 18px 20px;
  border-radius: 12px;
  background: #f9f4f6;
  border: 1px dashed #d6c0cb;
  color: #7c6270;
  font-style: italic;
}

/* Liste und Karten */

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.card {
  border-radius: 14px;
  border: 1px solid #ebdde5;
  background: #fff;
  padding: 14px 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  box-shadow: 0 2px 10px rgba(180, 145, 160, 0.15);
}

.card-main h2 {
  margin: 0 0 4px;
  font-size: 1.1rem;
  color: #3a2230;
}

.card-main p {
  margin: 2px 0;
}

.meta {
  font-size: 0.9rem;
  color: #6d5a65;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f7e3ec;
  border: 1px solid #e1c2d2;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Buttons an der Karte */

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.card-actions button {
  padding: 5px 10px;
  font-size: 0.8rem;
  border-radius: 999px;
  border: 1px solid #d8c2cf;
  background: #fdf8fb;
  cursor: pointer;
  color: #533243;
  transition: background 0.15s ease, transform 0.1s ease;
}

.card-actions button:hover {
  background: #f2dde9;
  transform: translateY(-1px);
}

/* Fehlertext */

.error {
  color: #b33;
  margin-top: 6px;
  font-size: 0.9rem;
}

/* Pop Up Hintergrund */

.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(40, 20, 30, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

/* Pop Up Box */

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

/* Felder im Pop Up */

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
.field select,
.field textarea {
  width: 100%;
  padding: 7px 9px;
  border-radius: 8px;
  border: 1px solid #d9c4d2;
  font-size: 0.95rem;
  background: #fff;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: #e1a9c8;
  box-shadow: 0 0 0 2px rgba(225, 169, 200, 0.35);
}

.field textarea {
  min-height: 80px;
}

/* Buttons im Pop Up */

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

.dialog-actions button:first-child:hover {
  opacity: 0.95;
}

.dialog-actions button:last-child:hover {
  background: #e7d6e3;
}

/* kleine Anpassung für schmale Bildschirme */

@media (max-width: 640px) {
  .page {
    padding: 16px;
    margin-top: 20px;
  }

  .card {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-actions {
    flex-direction: row;
  }
}
</style>
