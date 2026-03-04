<template>
  <div>
    <card section-name="Bulk Edit Actions">
      <p class="text-muted small mb-3">
        Registers custom bulk actions on list tables. Generates a <code>BulkEdit</code> class.
      </p>

      <div v-if="bulkEdits.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No bulk edit groups yet. Click <strong>+ Add Bulk Edit Group</strong>.</p>
      </div>

      <div v-for="(be, bi) in bulkEdits" :key="bi" class="wpgen-be-group mb-3">
        <div class="row align-items-end">
          <div class="col-md-4">
            <div class="form-group mb-0">
              <label>Post Type</label>
              <autocomplete-input
                :value="be.postType"
                context-key="postType"
                placeholder="post"
                @input="update(bi, 'postType', $event)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Class Name (optional)</label>
              <input type="text" class="form-control" :value="be.className" placeholder="Auto-generated"
                @input="update(bi, 'className', $event.target.value)" />
            </div>
          </div>
          <div class="col-md-2 text-right mt-4">
            <button type="button" class="btn btn-sm btn-outline-danger" @click="remove(bi)">
              <i class="fas fa-times"></i> Remove
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-2 pl-3 border-left">
          <h6 class="small text-muted mb-2">Bulk Actions</h6>

          <div v-for="(action, ai) in (be.actions || [])" :key="ai" class="row align-items-center mb-2">
            <div class="col-md-4">
              <input type="text" class="form-control form-control-sm" :value="action.action" placeholder="action-slug"
                @input="updateAction(bi, ai, 'action', $event.target.value)" />
            </div>
            <div class="col-md-5">
              <input type="text" class="form-control form-control-sm" :value="action.label" placeholder="Action Label"
                @input="updateAction(bi, ai, 'label', $event.target.value)" />
            </div>
            <div class="col-md-1 text-right">
              <button type="button" class="btn btn-sm btn-outline-danger" @click="removeAction(bi, ai)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <button type="button" class="btn btn-sm btn-outline-secondary" @click="addAction(bi)">
            + Add Action
          </button>
        </div>

        <hr v-if="bi < bulkEdits.length - 1" />
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
          + Add Bulk Edit Group
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
  name: 'BulkEditSection',
  components: { card, AutocompleteInput },
  computed: {
    ...mapGetters(['bulkEdits']),
  },
  methods: {
    add() { this.$store.dispatch('addBulkEdit'); },
    remove(bi) { this.$store.dispatch('removeBulkEdit', { index: bi }); },
    update(bi, key, value) { this.$store.dispatch('setBulkEditData', { index: bi, key, value }); },
    addAction(bi) { this.$store.dispatch('addBulkEditAction', { index: bi }); },
    removeAction(bi, ai) { this.$store.dispatch('removeBulkEditAction', { index: bi, actionIndex: ai }); },
    updateAction(bi, ai, key, value) { this.$store.dispatch('setBulkEditActionData', { index: bi, actionIndex: ai, key, value }); },
  },
};
</script>

<style scoped>
.wpgen-be-group { border: 1px solid #e2e4e7; border-radius: 4px; padding: 12px; background: #fafafa; }
.wpgen-empty-state { padding: 20px; text-align: center; }
</style>
