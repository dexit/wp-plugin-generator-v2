<template>
  <div>
    <card section-name="Settings API">
      <div v-if="settingsGroups.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No settings groups yet. Click <strong>+ Add Settings Group</strong>.</p>
      </div>

      <div v-for="(group, gi) in settingsGroups" :key="gi" class="wpgen-settings-group mb-3">
        <div class="row align-items-end">
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Group ID</label>
              <input
                type="text"
                class="form-control"
                :value="group.groupId"
                placeholder="my_plugin_settings"
                @input="updateGroup(gi, 'groupId', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Group Title</label>
              <input
                type="text"
                class="form-control"
                :value="group.groupTitle"
                placeholder="My Plugin Settings"
                @input="updateGroup(gi, 'groupTitle', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group mb-0">
              <label>Page Slug</label>
              <input
                type="text"
                class="form-control"
                :value="group.pageSlug"
                placeholder="my-plugin-settings"
                @input="updateGroup(gi, 'pageSlug', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group mb-0">
              <label>Capability</label>
              <autocomplete-input
                :value="group.capability || 'manage_options'"
                context-key="capability"
                placeholder="manage_options"
                @input="updateGroup(gi, 'capability', $event)"
              />
            </div>
          </div>
          <div class="col-md-2 text-right">
            <button type="button" class="btn btn-sm btn-outline-danger" @click="removeGroup(gi)">
              <i class="fas fa-times"></i> Remove Group
            </button>
          </div>
        </div>

        <!-- Sections inside group -->
        <div class="mt-3 pl-3 border-left">
          <h6 class="text-muted">Sections &amp; Fields</h6>

          <div v-for="(section, si) in (group.sections || [])" :key="si" class="mb-3 p-2 border rounded">
            <div class="row align-items-center">
              <div class="col-md-4">
                <div class="form-group mb-1">
                  <label class="small font-weight-bold">Section ID</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    :value="section.id"
                    placeholder="general_section"
                    @input="updateSection(gi, si, 'id', $event.target.value)"
                  />
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group mb-1">
                  <label class="small font-weight-bold">Section Title</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    :value="section.title"
                    placeholder="General Settings"
                    @input="updateSection(gi, si, 'title', $event.target.value)"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group mb-1">
                  <label class="small font-weight-bold">Description</label>
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    :value="section.description"
                    @input="updateSection(gi, si, 'description', $event.target.value)"
                  />
                </div>
              </div>
              <div class="col-md-1 text-right mt-3">
                <button type="button" class="btn btn-sm btn-outline-danger" @click="removeSection(gi, si)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Fields inside section -->
            <div class="mt-2 pl-2">
              <div
                v-for="(field, fi) in (section.fields || [])"
                :key="fi"
                class="row align-items-center mb-2"
              >
                <div class="col-md-3">
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    :value="field.id"
                    placeholder="Field ID"
                    @input="updateField(gi, si, fi, 'id', $event.target.value)"
                  />
                </div>
                <div class="col-md-3">
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    :value="field.title"
                    placeholder="Field Label"
                    @input="updateField(gi, si, fi, 'title', $event.target.value)"
                  />
                </div>
                <div class="col-md-2">
                  <select class="form-control form-control-sm" :value="field.type" @change="updateField(gi, si, fi, 'type', $event.target.value)">
                    <option value="">Type…</option>
                    <option v-for="t in fieldTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    :value="field.default"
                    placeholder="Default"
                    @input="updateField(gi, si, fi, 'default', $event.target.value)"
                  />
                </div>
                <div class="col-md-1">
                  <input
                    type="text"
                    class="form-control form-control-sm"
                    :value="field.description"
                    placeholder="Hint"
                    @input="updateField(gi, si, fi, 'description', $event.target.value)"
                  />
                </div>
                <div class="col-md-1 text-right">
                  <button type="button" class="btn btn-sm btn-outline-danger" @click="removeField(gi, si, fi)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <button type="button" class="btn btn-sm btn-outline-secondary" @click="addField(gi, si)">
                + Add Field
              </button>
            </div>
          </div>

          <button type="button" class="btn btn-sm btn-outline-secondary mt-2" @click="addSection(gi)">
            + Add Section
          </button>
        </div>

        <hr v-if="gi < settingsGroups.length - 1" />
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="addGroup">
          + Add Settings Group
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
  name: 'SettingsSection',
  components: { card, AutocompleteInput },
  computed: {
    ...mapGetters(['settingsGroups']),
    fieldTypes() {
      return WP_FIELD_TYPES;
    },
  },
  methods: {
    addGroup() {
      this.$store.dispatch('addSettingsGroup');
    },
    removeGroup(gi) {
      this.$store.dispatch('removeSettingsGroup', { index: gi });
    },
    updateGroup(gi, key, value) {
      this.$store.dispatch('setSettingsGroupData', { index: gi, key, value });
    },
    addSection(gi) {
      this.$store.dispatch('addSettingsSection', { groupIndex: gi });
    },
    removeSection(gi, si) {
      this.$store.dispatch('removeSettingsSection', { groupIndex: gi, sectionIndex: si });
    },
    updateSection(gi, si, key, value) {
      this.$store.dispatch('setSettingsSectionData', { groupIndex: gi, sectionIndex: si, key, value });
    },
    addField(gi, si) {
      this.$store.dispatch('addSettingsField', { groupIndex: gi, sectionIndex: si });
    },
    removeField(gi, si, fi) {
      this.$store.dispatch('removeSettingsField', { groupIndex: gi, sectionIndex: si, fieldIndex: fi });
    },
    updateField(gi, si, fi, key, value) {
      this.$store.dispatch('setSettingsFieldData', { groupIndex: gi, sectionIndex: si, fieldIndex: fi, key, value });
    },
  },
};
</script>

<style scoped>
.wpgen-settings-group {
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
