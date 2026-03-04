<template>
  <div>
    <card section-name="Taxonomy Term Fields">
      <p class="text-muted small mb-3">
        Adds custom fields to taxonomy term add/edit screens. Generates a <code>TermFields</code> class per taxonomy.
      </p>

      <div v-if="termFieldGroups.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No term field groups yet. Click <strong>+ Add Taxonomy Group</strong>.</p>
      </div>

      <div v-for="(group, gi) in termFieldGroups" :key="gi" class="wpgen-termfield-group mb-3">
        <div class="row align-items-end">
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Taxonomy</label>
              <autocomplete-input
                :value="group.taxonomy"
                context-key="taxonomy"
                placeholder="category"
                @input="updateGroup(gi, 'taxonomy', $event)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Class Name (optional)</label>
              <input
                type="text"
                class="form-control"
                :value="group.className"
                placeholder="Auto-generated"
                @input="updateGroup(gi, 'className', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-2 text-right mt-4">
            <button type="button" class="btn btn-sm btn-outline-danger" @click="removeGroup(gi)">
              <i class="fas fa-times"></i> Remove
            </button>
          </div>
        </div>

        <!-- Fields -->
        <div class="mt-2 pl-3 border-left">
          <h6 class="small text-muted mb-2">Fields</h6>

          <div v-for="(field, fi) in (group.fields || [])" :key="fi" class="row align-items-center mb-2">
            <div class="col-md-3">
              <input
                type="text"
                class="form-control form-control-sm"
                :value="field.key"
                placeholder="meta_key"
                @input="updateField(gi, fi, 'key', $event.target.value)"
              />
            </div>
            <div class="col-md-3">
              <input
                type="text"
                class="form-control form-control-sm"
                :value="field.label"
                placeholder="Field Label"
                @input="updateField(gi, fi, 'label', $event.target.value)"
              />
            </div>
            <div class="col-md-2">
              <select class="form-control form-control-sm" :value="field.type || 'text'" @change="updateField(gi, fi, 'type', $event.target.value)">
                <option v-for="t in fieldTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="col-md-3">
              <input
                type="text"
                class="form-control form-control-sm"
                :value="field.description"
                placeholder="Description"
                @input="updateField(gi, fi, 'description', $event.target.value)"
              />
            </div>
            <div class="col-md-1 text-right">
              <button type="button" class="btn btn-sm btn-outline-danger" @click="removeField(gi, fi)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <button type="button" class="btn btn-sm btn-outline-secondary" @click="addField(gi)">
            + Add Field
          </button>
        </div>

        <hr v-if="gi < termFieldGroups.length - 1" />
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="addGroup">
          + Add Taxonomy Group
        </button>
      </div>
    </card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import card from '../card';
import AutocompleteInput from '@/components/Common/AutocompleteInput';
import { WP_FIELD_TYPES } from '@/utils/wp-autocomplete';

export default {
  name: 'TermFieldsSection',
  components: { card, AutocompleteInput },
  computed: {
    ...mapGetters(['termFieldGroups']),
    fieldTypes() { return WP_FIELD_TYPES; },
  },
  methods: {
    addGroup() { this.$store.dispatch('addTermFieldGroup'); },
    removeGroup(gi) { this.$store.dispatch('removeTermFieldGroup', { index: gi }); },
    updateGroup(gi, key, value) { this.$store.dispatch('setTermFieldGroupData', { index: gi, key, value }); },
    addField(gi) { this.$store.dispatch('addTermField', { groupIndex: gi }); },
    removeField(gi, fi) { this.$store.dispatch('removeTermField', { groupIndex: gi, fieldIndex: fi }); },
    updateField(gi, fi, key, value) { this.$store.dispatch('setTermFieldData', { groupIndex: gi, fieldIndex: fi, key, value }); },
  },
};
</script>

<style scoped>
.wpgen-termfield-group {
  border: 1px solid #e2e4e7;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
}
.wpgen-empty-state { padding: 20px; text-align: center; }
</style>
