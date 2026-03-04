<template>
  <div>
    <card section-name="Screen Options">
      <p class="text-muted small mb-3">
        Register per-page screen option preferences (e.g. items per page, visible columns).
        Generates a <code>ScreenOptions</code> class.
      </p>

      <div v-if="screenOptions.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No screen options yet. Click <strong>+ Add Screen Option</strong>.</p>
      </div>

      <div v-for="(so, si) in screenOptions" :key="si" class="wpgen-so-item mb-3">
        <div class="row align-items-end">
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Screen ID</label>
              <input
                type="text"
                class="form-control"
                :value="so.screen"
                placeholder="edit-post"
                @input="update(si, 'screen', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Option Key</label>
              <input
                type="text"
                class="form-control"
                :value="so.option"
                placeholder="per_page"
                @input="update(si, 'option', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Label</label>
              <input
                type="text"
                class="form-control"
                :value="so.label"
                placeholder="Items per page"
                @input="update(si, 'label', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-1">
            <div class="form-group mb-0">
              <label>Default</label>
              <input
                type="number"
                class="form-control"
                :value="so.default || 20"
                min="1"
                max="200"
                @input="update(si, 'default', parseInt($event.target.value) || 20)"
              />
            </div>
          </div>
          <div class="col-md-2 text-right mt-4">
            <button type="button" class="btn btn-sm btn-outline-danger" @click="remove(si)">
              <i class="fas fa-times"></i> Remove
            </button>
          </div>
        </div>

        <div class="row mt-2">
          <div class="col-md-4">
            <label class="small font-weight-bold d-block">Type</label>
            <select
              class="form-control form-control-sm"
              :value="so.type || 'per_page'"
              @change="update(si, 'type', $event.target.value)"
            >
              <option value="per_page">Per Page (integer)</option>
              <option value="columns">Columns (array)</option>
            </select>
          </div>
          <div class="col-md-4">
            <div class="form-group mb-0">
              <label class="small font-weight-bold">Class Name (optional)</label>
              <input
                type="text"
                class="form-control form-control-sm"
                :value="so.className"
                placeholder="Auto-generated"
                @input="update(si, 'className', $event.target.value)"
              />
            </div>
          </div>
        </div>

        <hr v-if="si < screenOptions.length - 1" />
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
          + Add Screen Option
        </button>
      </div>
    </card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import card from '../card';

export default {
  name: 'ScreenOptionsSection',
  components: { card },
  computed: {
    ...mapGetters(['screenOptions']),
  },
  methods: {
    add() { this.$store.dispatch('addScreenOption'); },
    remove(si) { this.$store.dispatch('removeScreenOption', { index: si }); },
    update(si, key, value) { this.$store.dispatch('setScreenOptionData', { index: si, key, value }); },
  },
};
</script>

<style scoped>
.wpgen-so-item { border: 1px solid #e2e4e7; border-radius: 4px; padding: 12px; background: #fafafa; }
.wpgen-empty-state { padding: 20px; text-align: center; }
</style>
