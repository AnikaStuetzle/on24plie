<template>
  <div class="page-container">
    <h2>Lexikon</h2>
    <form class="lexicon-form" @submit.prevent="addEntry">
      <input v-model="newTerm" placeholder="Begriff" required />
      <input v-model="newDef" placeholder="Definition" required />
      <button>Hinzufügen</button>
    </form>

    <input v-model="search" placeholder="Suche Begriff" class="search-field" />

    <div class="lexicon-list-box">
      <ul v-if="sortedLexicon.length > 0">
        <li v-for="entry in filteredLexicon" :key="entry.id">
          <template v-if="editId !== entry.id">
            <div>
              <strong>{{ entry.term }}</strong
              >: {{ entry.definition }}
            </div>
            <div class="actions">
              <button @click="startEdit(entry)">Edit</button>
              <button @click="deleteEntry(entry.id)">Löschen</button>
            </div>
          </template>
          <template v-else>
            <div>
              <input v-model="editTerm" />
              <input v-model="editDef" />
            </div>
            <div class="actions">
              <button @click="saveEdit(entry.id)">Speichern</button>
              <button @click="cancelEdit">Abbrechen</button>
            </div>
          </template>
        </li>
      </ul>
      <div v-else class="empty">Keine Begriffe vorhanden.</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LexiconView",
  data() {
    return {
      lexicon: [],
      newTerm: "",
      newDef: "",
      editId: null,
      editTerm: "",
      editDef: "",
      search: "",
    };
  },
  computed: {
    sortedLexicon() {
      return [...this.lexicon].sort((a, b) =>
        a.term.localeCompare(b.term, "de", { sensitivity: "base" })
      );
    },
    filteredLexicon() {
      if (!this.search.trim()) return this.sortedLexicon;
      const s = this.search.trim().toLowerCase();
      return this.sortedLexicon.filter(
        (e) =>
          e.term.toLowerCase().includes(s) ||
          (e.definition && e.definition.toLowerCase().includes(s))
      );
    },
  },
  methods: {
    async fetchLexicon() {
      try {
        const res = await fetch("http://localhost:8010/api/lexicon");
        this.lexicon = await res.json();
      } catch (e) {
        this.lexicon = [];
      }
    },
    async addEntry() {
      if (!this.newTerm.trim() || !this.newDef.trim()) return;
      await fetch("http://localhost:8010/api/lexicon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: this.newTerm, definition: this.newDef }),
      });
      this.newTerm = "";
      this.newDef = "";
      await this.fetchLexicon();
    },
    async deleteEntry(id) {
      await fetch(`http://localhost:8010/api/lexicon/${id}`, {
        method: "DELETE",
      });
      await this.fetchLexicon();
    },
    startEdit(entry) {
      this.editId = entry.id;
      this.editTerm = entry.term;
      this.editDef = entry.definition;
    },
    async saveEdit(id) {
      await fetch(`http://localhost:8010/api/lexicon/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: this.editTerm,
          definition: this.editDef,
        }),
      });
      this.editId = null;
      await this.fetchLexicon();
    },
    cancelEdit() {
      this.editId = null;
      this.editTerm = "";
      this.editDef = "";
    },
  },
  mounted() {
    this.fetchLexicon();
  },
};
</script>

<style scoped>
.page-container {
  max-width: 400px;
  margin: 3.5rem auto 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 3px 20px rgba(130, 70, 130, 0.08),
    0 1.5px 7px rgba(60, 60, 60, 0.11);
  padding: 2rem 1.2rem 1rem 1.2rem;
}
h2 {
  text-align: center;
  font-weight: 500;
  color: #ab4491;
  margin-bottom: 1.2rem;
  letter-spacing: 0.35px;
}
.lexicon-form {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
}

input,
button {
  font-size: 1rem;
  border-radius: 7px;
}
input {
  background: #faf6fa;
  border: none;
  padding: 0.68rem 1.05rem;
  margin-bottom: 0;
  color: #222;
  box-shadow: 0 1px 3px rgba(60, 60, 60, 0.02);
}
input:focus {
  outline: none;
  background: #f7eafc;
  box-shadow: 0 0 0 2px #e3b0d2;
}
.search-field {
  width: 100%;
  box-sizing: border-box;
  padding: 0.9rem 1.1rem;
  background: #f8e2f7;
  border: 2.5px solid #e3b0d2;
  border-radius: 10px;
  margin-bottom: 1.1rem;
  font-size: 1rem;
  color: #b64e94;
  box-shadow: 0 1.5px 7px rgba(200, 60, 160, 0.03);
  transition: border-color 0.16s, background 0.16s;
}
.search-field:focus {
  outline: none;
  border-color: #b64e94;
  background: #f4c3ea;
}

.lexicon-form button,
.actions button {
  padding: 0.48rem 0.8rem;
  background: linear-gradient(90deg, #e3b0d2 0%, #c79fcf 100%);
  color: #222;
  border: none;
  border-radius: 7px;
  font-weight: 500;
  margin-top: 0.4rem;
  box-shadow: 0 1px 4px rgba(160, 100, 150, 0.06);
  cursor: pointer;
  transition: background 0.2s;
}
.lexicon-form button:hover,
.actions button:hover {
  background: linear-gradient(90deg, #d493bf 0%, #a780b1 100%);
  color: #fff;
}
.actions {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  margin-left: 0.7rem;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  background: #fff;
  border-radius: 7px;
  box-shadow: 0 1.5px 7px rgba(60, 60, 60, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.8rem;
  margin-bottom: 0.85rem;
  font-size: 0.98rem;
  font-family: inherit;
}
li strong {
  color: #ae3d95;
  font-weight: 500;
  letter-spacing: 0.3px;
  margin-right: 0.45rem;
}
.empty {
  opacity: 0.5;
  font-size: 0.99rem;
  text-align: center;
  padding: 0.5rem 0;
}
</style>
--- ## **Backend-Ergänzung (PUT für Bearbeiten)** Dein lexicon-Router braucht
zusätzlich:
