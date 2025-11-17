<template>
  <div class="workouts-container">
    <h1>Workouts</h1>
    <form class="workout-form" @submit.prevent="addWorkout">
      <input v-model="newWorkout" placeholder="Neues Workout hinzufügen" />
      <button type="submit">+</button>
    </form>
    <ul class="workout-list">
      <li
        v-for="(workout, idx) in workouts"
        :key="workout.id"
        class="workout-item"
      >
        <span v-if="!workout.edit">{{ workout.name }}</span>
        <input
          v-else
          v-model="workout.name"
          @keydown.enter="finishEdit(workout)"
        />
        <button @click="editWorkout(workout)" v-if="!workout.edit">
          Bearbeiten
        </button>
        <button @click="finishEdit(workout)" v-if="workout.edit">
          Speichern
        </button>
        <button @click="deleteWorkout(idx)">Löschen</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";
const workouts = ref([
  // Beispielstartdaten
  { id: 1, name: "Ganzkörper", edit: false },
  { id: 2, name: "Beine & Core", edit: false },
]);
const newWorkout = ref("");

function addWorkout() {
  if (newWorkout.value.trim().length > 0) {
    workouts.value.push({
      id: Date.now(),
      name: newWorkout.value,
      edit: false,
    });
    newWorkout.value = "";
  }
}
function deleteWorkout(idx) {
  workouts.value.splice(idx, 1);
}
function editWorkout(workout) {
  workout.edit = true;
}
function finishEdit(workout) {
  workout.edit = false;
}
</script>

<style scoped>
.workouts-container {
  max-width: 480px;
  margin: 52px auto;
  padding: 36px 32px 28px 32px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 28px;
  box-shadow: 0 8px 40px rgba(180, 140, 140, 0.13);
  backdrop-filter: blur(14px);
  text-align: center;
}
.workout-form {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}
.workout-form input {
  flex: 1;
  padding: 10px 15px;
  border-radius: 14px;
  border: none;
  background: rgba(240, 225, 225, 0.34);
  box-shadow: 0 1px 8px rgba(180, 140, 140, 0.1);
  transition: background 0.21s;
}
.workout-form button {
  padding: 9px 17px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(90deg, #d5b8c2 30%, #e7c3c7 100%);
  color: #5d2246;
  font-weight: 500;
  box-shadow: 0 1px 8px rgba(192, 140, 160, 0.12);
  cursor: pointer;
}
.workout-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.workout-item {
  background: rgba(240, 225, 225, 0.18);
  border-radius: 16px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 7px rgba(190, 115, 145, 0.09);
  padding: 11px 13px;
  font-size: 1.09em;
  transition: box-shadow 0.21s;
}
.workout-item button {
  padding: 7px 14px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(90deg, #f4d5db 30%, #e7c3c7 100%);
  color: #5d2246;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.96em;
  transition: background 0.23s;
}
.workout-item button:hover {
  background: linear-gradient(90deg, #e7c3c7 0%, #d5b8c2 100%);
}
.workout-item input {
  border-radius: 10px;
  padding: 7px 9px;
  font-size: 1em;
  border: none;
  background: rgba(245, 220, 230, 0.41);
}
</style>
