<template>
  <div>
    <card section-name="Edit Screen (Meta Boxes)">
      <div v-if="metaBoxes.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No meta boxes yet. Click <strong>+ Add Meta Box</strong>.</p>
      </div>

      <div v-for="(mb, i) in metaBoxes" :key="i" class="wpgen-metabox-item mb-3">
        <div class="row align-items-end">
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Meta Box ID</label>
              <input
                type="text"
                class="form-control"
                :value="mb.id"
                placeholder="my_meta_box"
                @input="update(i, 'id', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Title</label>
              <input
                type="text"
                class="form-control"
                :value="mb.title"
                placeholder="My Meta Box"
                @input="update(i, 'title', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group mb-0">
              <label>Post Types</label>
              <tags-input
                :value="mb.postTypes || ['post']"
                :suggestions="wpPostTypes"
                placeholder="post, page…"
                @input="update(i, 'postTypes', $event)"
              />
            </div>
          </div>
          <div class="col-md-1">
            <div class="form-group mb-0">
              <label>Context</label>
              <select class="form-control" :value="mb.context || 'normal'" @change="update(i, 'context', $event.target.value)">
                <option value="normal">normal</option>
                <option value="side">side</option>
                <option value="advanced">advanced</option>
              </select>
            </div>
          </div>
          <div class="col-md-1">
            <div class="form-group mb-0">
              <label>Priority</label>
              <select class="form-control" :value="mb.priority || 'default'" @change="update(i, 'priority', $event.target.value)">
                <option value="high">high</option>
                <option value="default">default</option>
                <option value="low">low</option>
              </select>
            </div>
          </div>
          <div class="col-md-2 text-right">
            <button type="button" class="btn btn-sm btn-outline-danger" @click="remove(i)">
              <i class="fas fa-times"></i> Remove
            </button>
          </div>
        </div>

        <!-- Fields -->
        <div class="mt-2 pl-3 border-left">
          <h6 class="small text-muted mb-2">Fields</h6>

          <div v-for="(field, fi) in (mb.fields || [])" :key="fi" class="row align-items-center mb-2">
            <div class="col-md-3">
              <input
                type="text"
                class="form-control form-control-sm"
                :value="field.key"
                placeholder="meta_key"
                @input="updateField(i, fi, 'key', $event.target.value)"
              />
            </div>
            <div class="col-md-3">
              <input
                type="text"
                class="form-control form-control-sm"
                :value="field.label"
                placeholder="Field Label"
                @input="updateField(i, fi, 'label', $event.target.value)"
              />
            </div>
            <div class="col-md-2">
              <select class="form-control form-control-sm" :value="field.type || 'text'" @change="updateField(i, fi, 'type', $event.target.value)">
                <option v-for="t in fieldTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="col-md-3">
              <input
                type="text"
                class="form-control form-control-sm"
                :value="field.description"
                placeholder="Description (shown below field)"
                @input="updateField(i, fi, 'description', $event.target.value)"
              />
            </div>
            <div class="col-md-1 text-right">
              <button type="button" class="btn btn-sm btn-outline-danger" @click="removeField(i, fi)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <button type="button" class="btn btn-sm btn-outline-secondary" @click="addField(i)">
            + Add Field
          </button>
        </div>

        <hr v-if="i < metaBoxes.length - 1" />
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
          + Add Meta Box
        </button>
      </div>
    </card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import card from '../card';
import TagsInput from '@/components/Common/TagsInput';
import { WP_POST_TYPES, WP_FIELD_TYPES } from '@/utils/wp-autocomplete';

export default {
  name: 'MetaBoxSection',
  components: { card, TagsInput },
  computed: {
    ...mapGetters(['metaBoxes']),
    wpPostTypes() {
      return WP_POST_TYPES;
    },
    fieldTypes() {
      return WP_FIELD_TYPES;
    },
  },
  methods: {
    add() { this.$store.dispatch('addMetaBox'); },
    remove(i) { this.$store.dispatch('removeMetaBox', { index: i }); },
    update(i, key, value) { this.$store.dispatch('setMetaBoxData', { index: i, key, value }); },
    addField(i) { this.$store.dispatch('addMetaBoxField', { index: i }); },
    removeField(i, fi) { this.$store.dispatch('removeMetaBoxField', { index: i, fieldIndex: fi }); },
    updateField(i, fi, key, value) {
      this.$store.dispatch('setMetaBoxFieldData', { index: i, fieldIndex: fi, key, value });
    },
  },
};
</script>

<style scoped>
.wpgen-metabox-item {
  border: 1px solid #e2e4e7;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
}
.wpgen-empty-state {
  padding: 20px;
  text-align: center;
}
</style>
