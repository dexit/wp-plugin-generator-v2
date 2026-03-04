<template>
  <div>
    <card section-name="REST Post Fields (register_rest_field)">
      <p class="text-muted small mb-3">
        Expose custom post meta fields via the WP REST API using <code>register_rest_field()</code>.
      </p>

      <div v-if="postRestFields.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No REST post fields yet. Click <strong>+ Add REST Field</strong>.</p>
      </div>

      <div
        v-for="(field, i) in postRestFields"
        :key="i"
        class="row align-items-center mb-2"
      >
        <div class="col-md-2">
          <input type="text" class="form-control form-control-sm" :value="field.fieldName" placeholder="field_name"
            @input="update(i, 'fieldName', $event.target.value)" />
        </div>
        <div class="col-md-3">
          <tags-input
            :value="field.postTypes || ['post']"
            :suggestions="wpPostTypes"
            placeholder="post, page…"
            @input="update(i, 'postTypes', $event)"
          />
        </div>
        <div class="col-md-2">
          <select class="form-control form-control-sm" :value="field.type || 'string'" @change="update(i, 'type', $event.target.value)">
            <option value="string">string</option>
            <option value="integer">integer</option>
            <option value="boolean">boolean</option>
            <option value="number">number</option>
            <option value="array">array</option>
          </select>
        </div>
        <div class="col-md-2">
          <input type="text" class="form-control form-control-sm" :value="field.description" placeholder="Description"
            @input="update(i, 'description', $event.target.value)" />
        </div>
        <div class="col-md-1">
          <label class="small d-block mb-0">Read-only</label>
          <toggle-input :value="field.readonly === true" @input="update(i, 'readonly', $event)" />
        </div>
        <div class="col-md-1 text-right">
          <button type="button" class="btn btn-sm btn-outline-danger" @click="remove(i)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
          + Add REST Field
        </button>
      </div>
    </card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import card from '../card';
import TagsInput from '@/components/Common/TagsInput';
import ToggleInput from '@/components/Common/ToggleInput';
import { WP_POST_TYPES } from '@/utils/wp-autocomplete';

export default {
  name: 'PostRestFieldsSection',
  components: { card, TagsInput, ToggleInput },
  computed: {
    ...mapGetters(['postRestFields']),
    wpPostTypes() { return WP_POST_TYPES; },
  },
  methods: {
    add() { this.$store.dispatch('addPostRestField'); },
    remove(i) { this.$store.dispatch('removePostRestField', { index: i }); },
    update(i, key, value) { this.$store.dispatch('setPostRestFieldData', { index: i, key, value }); },
  },
};
</script>

<style scoped>
.wpgen-empty-state { padding: 20px; text-align: center; }
</style>
