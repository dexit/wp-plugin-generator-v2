<template>
  <div>
    <card section-name="Quick Edit Fields">
      <p class="text-muted small mb-3">
        Adds custom columns and inline quick-edit fields to list tables. Generates a <code>QuickEdit</code> class.
      </p>

      <div v-if="quickEdits.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No quick edit groups yet. Click <strong>+ Add Quick Edit Group</strong>.</p>
      </div>

      <div v-for="(qe, qi) in quickEdits" :key="qi" class="wpgen-qe-group mb-3">
        <div class="row align-items-end">
          <div class="col-md-4">
            <div class="form-group mb-0">
              <label>Post Type</label>
              <autocomplete-input
                :value="qe.postType"
                context-key="postType"
                placeholder="post"
                @input="update(qi, 'postType', $event)"
              />
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group mb-0">
              <label>Class Name (optional)</label>
              <input
                type="text"
                class="form-control"
                :value="qe.className"
                placeholder="Auto-generated"
                @input="update(qi, 'className', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-2 text-right mt-4">
            <button type="button" class="btn btn-sm btn-outline-danger" @click="remove(qi)">
              <i class="fas fa-times"></i> Remove
            </button>
          </div>
        </div>

        <!-- Fields -->
        <div class="mt-2 pl-3 border-left">
          <h6 class="small text-muted mb-2">Custom Column / Quick Edit Fields</h6>

          <div v-for="(field, fi) in (qe.fields || [])" :key="fi" class="row align-items-center mb-2">
            <div class="col-md-3">
              <input type="text" class="form-control form-control-sm" :value="field.key" placeholder="meta_key"
                @input="updateField(qi, fi, 'key', $event.target.value)" />
            </div>
            <div class="col-md-3">
              <input type="text" class="form-control form-control-sm" :value="field.label" placeholder="Column Label"
                @input="updateField(qi, fi, 'label', $event.target.value)" />
            </div>
            <div class="col-md-2">
              <select class="form-control form-control-sm" :value="field.type || 'text'" @change="updateField(qi, fi, 'type', $event.target.value)">
                <option value="text">text</option>
                <option value="number">number</option>
                <option value="select">select</option>
                <option value="checkbox">checkbox</option>
              </select>
            </div>
            <div class="col-md-1 text-right">
              <button type="button" class="btn btn-sm btn-outline-danger" @click="removeField(qi, fi)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <button type="button" class="btn btn-sm btn-outline-secondary" @click="addField(qi)">
            + Add Field
          </button>
        </div>

        <hr v-if="qi < quickEdits.length - 1" />
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
          + Add Quick Edit Group
        </button>
      </div>
    </card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import card from '../card';
import AutocompleteInput from '@/components/Common/AutocompleteInput';

export default {
  name: 'QuickEditSection',
  components: { card, AutocompleteInput },
  computed: {
    ...mapGetters(['quickEdits']),
  },
  methods: {
    add() { this.$store.dispatch('addQuickEdit'); },
    remove(qi) { this.$store.dispatch('removeQuickEdit', { index: qi }); },
    update(qi, key, value) { this.$store.dispatch('setQuickEditData', { index: qi, key, value }); },
    addField(qi) { this.$store.dispatch('addQuickEditField', { index: qi }); },
    removeField(qi, fi) { this.$store.dispatch('removeQuickEditField', { index: qi, fieldIndex: fi }); },
    updateField(qi, fi, key, value) { this.$store.dispatch('setQuickEditFieldData', { index: qi, fieldIndex: fi, key, value }); },
  },
};
</script>

<style scoped>
.wpgen-qe-group { border: 1px solid #e2e4e7; border-radius: 4px; padding: 12px; background: #fafafa; }
.wpgen-empty-state { padding: 20px; text-align: center; }
</style>
