<template>
  <div>
    <card section-name="WP Importers">
      <p class="text-muted small mb-3">
        Register custom data importers via <code>register_importer()</code>.
        Generates <code>WP_Importer</code> subclasses with upload, parse, and import steps.
      </p>

      <div v-if="importers.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No importers yet. Click <strong>+ Add Importer</strong>.</p>
      </div>

      <div v-for="(imp, ii) in importers" :key="ii" class="wpgen-imp-item mb-3">
        <div class="row align-items-end">
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Importer ID</label>
              <input
                type="text"
                class="form-control"
                :value="imp.id"
                placeholder="my-importer"
                @input="update(ii, 'id', $event.target.value)"
              />
              <small class="form-text text-muted">Unique slug for register_importer()</small>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group mb-0">
              <label>Display Name</label>
              <input
                type="text"
                class="form-control"
                :value="imp.name"
                placeholder="My Data Importer"
                @input="update(ii, 'name', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Class Name (optional)</label>
              <input
                type="text"
                class="form-control"
                :value="imp.className"
                placeholder="Auto-generated"
                @input="update(ii, 'className', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-2 text-right mt-4">
            <button type="button" class="btn btn-sm btn-outline-danger" @click="remove(ii)">
              <i class="fas fa-times"></i> Remove
            </button>
          </div>
        </div>

        <div class="row mt-2">
          <div class="col-md-8">
            <div class="form-group mb-0">
              <label class="small font-weight-bold">Description</label>
              <input
                type="text"
                class="form-control form-control-sm"
                :value="imp.description"
                placeholder="Imports data from a CSV file."
                @input="update(ii, 'description', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group mb-0">
              <label class="small font-weight-bold">Accepted File Types</label>
              <input
                type="text"
                class="form-control form-control-sm"
                :value="imp.fileTypes"
                placeholder=".csv, .xml"
                @input="update(ii, 'fileTypes', $event.target.value)"
              />
            </div>
          </div>
        </div>

        <hr v-if="ii < importers.length - 1" />
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
          + Add Importer
        </button>
      </div>
    </card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import card from '../card';

export default {
  name: 'ImportersSection',
  components: { card },
  computed: {
    ...mapGetters(['importers']),
  },
  methods: {
    add() { this.$store.dispatch('addImporter'); },
    remove(ii) { this.$store.dispatch('removeImporter', { index: ii }); },
    update(ii, key, value) { this.$store.dispatch('setImporterData', { index: ii, key, value }); },
  },
};
</script>

<style scoped>
.wpgen-imp-item { border: 1px solid #e2e4e7; border-radius: 4px; padding: 12px; background: #fafafa; }
.wpgen-empty-state { padding: 20px; text-align: center; }
</style>
