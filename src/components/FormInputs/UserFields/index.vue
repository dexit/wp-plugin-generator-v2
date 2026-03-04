<template>
  <div>
    <card section-name="User Profile Fields">
      <p class="text-muted small mb-3">
        Adds custom fields to user profile &amp; edit-user screens. Generates a <code>UserFields</code> class.
      </p>

      <div v-if="userFields.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No user fields yet. Click <strong>+ Add User Field</strong>.</p>
      </div>

      <div
        v-for="(field, i) in userFields"
        :key="i"
        class="row align-items-center mb-2"
      >
        <div class="col-md-2">
          <input
            type="text"
            class="form-control form-control-sm"
            :value="field.key"
            placeholder="meta_key"
            @input="update(i, 'key', $event.target.value)"
          />
        </div>
        <div class="col-md-3">
          <input
            type="text"
            class="form-control form-control-sm"
            :value="field.label"
            placeholder="Field Label"
            @input="update(i, 'label', $event.target.value)"
          />
        </div>
        <div class="col-md-2">
          <select class="form-control form-control-sm" :value="field.type || 'text'" @change="update(i, 'type', $event.target.value)">
            <option v-for="t in fieldTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <input
            type="text"
            class="form-control form-control-sm"
            :value="field.section"
            placeholder="Section heading"
            @input="update(i, 'section', $event.target.value)"
          />
        </div>
        <div class="col-md-2">
          <input
            type="text"
            class="form-control form-control-sm"
            :value="field.description"
            placeholder="Description"
            @input="update(i, 'description', $event.target.value)"
          />
        </div>
        <div class="col-md-1 text-right">
          <button type="button" class="btn btn-sm btn-outline-danger" @click="remove(i)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
          + Add User Field
        </button>
      </div>
    </card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import card from '../card';
import { WP_FIELD_TYPES } from '@/utils/wp-autocomplete';

export default {
  name: 'UserFieldsSection',
  components: { card },
  computed: {
    ...mapGetters(['userFields']),
    fieldTypes() {
      return WP_FIELD_TYPES;
    },
  },
  methods: {
    add() { this.$store.dispatch('addUserField'); },
    remove(i) { this.$store.dispatch('removeUserField', { index: i }); },
    update(i, key, value) { this.$store.dispatch('setUserFieldData', { index: i, key, value }); },
  },
};
</script>

<style scoped>
.wpgen-empty-state { padding: 20px; text-align: center; }
</style>
