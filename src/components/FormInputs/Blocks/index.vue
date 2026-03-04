<template>
  <div>
    <card section-name="WP Blocks (Gutenberg)">
      <p class="text-muted small mb-3">
        Generate Gutenberg blocks using the <code>@wordpress/scripts</code> toolchain.
        Produces <code>block.json</code>, PHP registration, editor JS, and CSS per block.
      </p>

      <div v-if="blocks.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No blocks yet. Click <strong>+ Add Block</strong> to get started.</p>
      </div>

      <!-- ── Per-block card ─────────────────────────────── -->
      <div v-for="(block, bi) in blocks" :key="bi" class="wpgen-block-item mb-4">

        <!-- Header row -->
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="text-primary">
            {{ block.title || ('Block ' + (bi + 1)) }}
            <span v-if="block.dynamic" class="badge badge-info ml-1">Dynamic</span>
          </strong>
          <button type="button" class="btn btn-sm btn-outline-danger" @click="removeBlock(bi)">
            <i class="fas fa-times"></i> Remove
          </button>
        </div>

        <!-- Row 1: name / title / category -->
        <div class="row">
          <div class="col-md-3">
            <div class="form-group">
              <label class="small font-weight-bold">Block Name (slug)</label>
              <input
                type="text"
                class="form-control form-control-sm"
                :value="block.name"
                placeholder="my-block"
                @input="update(bi, 'name', $event.target.value)"
              />
              <small class="form-text text-muted">Namespace/slug, e.g. <code>hero-section</code></small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label class="small font-weight-bold">Title</label>
              <input
                type="text"
                class="form-control form-control-sm"
                :value="block.title"
                placeholder="Hero Section"
                @input="update(bi, 'title', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label class="small font-weight-bold">Category</label>
              <select
                class="form-control form-control-sm"
                :value="block.category || 'common'"
                @change="update(bi, 'category', $event.target.value)"
              >
                <option value="text">Text</option>
                <option value="media">Media</option>
                <option value="design">Design</option>
                <option value="widgets">Widgets</option>
                <option value="theme">Theme</option>
                <option value="embed">Embed</option>
                <option value="common">Common (default)</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <label class="small font-weight-bold">Icon (Dashicon)</label>
              <autocomplete-input
                :value="block.icon || ''"
                context-key="menuIcon"
                placeholder="block-default"
                @input="update(bi, 'icon', $event)"
              />
            </div>
          </div>
        </div>

        <!-- Row 2: description / keywords -->
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="small font-weight-bold">Description</label>
              <input
                type="text"
                class="form-control form-control-sm"
                :value="block.description"
                placeholder="A short block description."
                @input="update(bi, 'description', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="small font-weight-bold">Keywords (comma-separated)</label>
              <input
                type="text"
                class="form-control form-control-sm"
                :value="block.keywords"
                placeholder="hero, banner, cta"
                @input="update(bi, 'keywords', $event.target.value)"
              />
            </div>
          </div>
        </div>

        <!-- Row 3: toggles -->
        <div class="row mb-2">
          <div class="col-md-2">
            <label class="small font-weight-bold d-block">Dynamic (PHP render)</label>
            <toggle-input
              :value="block.dynamic === true"
              @input="update(bi, 'dynamic', $event)"
            />
          </div>
          <div class="col-md-2">
            <label class="small font-weight-bold d-block">Anchor support</label>
            <toggle-input
              :value="block.supportsAnchor === true"
              @input="update(bi, 'supportsAnchor', $event)"
            />
          </div>
          <div class="col-md-2">
            <label class="small font-weight-bold d-block">Align support</label>
            <toggle-input
              :value="block.supportsAlign === true"
              @input="update(bi, 'supportsAlign', $event)"
            />
          </div>
          <div class="col-md-2">
            <label class="small font-weight-bold d-block">Color support</label>
            <toggle-input
              :value="block.supportsColor === true"
              @input="update(bi, 'supportsColor', $event)"
            />
          </div>
          <div class="col-md-2">
            <label class="small font-weight-bold d-block">Typography</label>
            <toggle-input
              :value="block.supportsTypo === true"
              @input="update(bi, 'supportsTypo', $event)"
            />
          </div>
          <div class="col-md-2">
            <label class="small font-weight-bold d-block">Spacing</label>
            <toggle-input
              :value="block.supportsSpacing === true"
              @input="update(bi, 'supportsSpacing', $event)"
            />
          </div>
        </div>

        <!-- Attributes sub-panel -->
        <div class="wpgen-sub-panel mt-2">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="small font-weight-bold">Block Attributes</span>
            <button type="button" class="btn btn-xs btn-outline-secondary" @click="addAttr(bi)">
              + Add Attribute
            </button>
          </div>

          <div v-if="!block.attributes || block.attributes.length === 0" class="text-muted small">
            No attributes defined.
          </div>

          <div
            v-for="(attr, ai) in (block.attributes || [])"
            :key="ai"
            class="row align-items-end mb-1"
          >
            <div class="col-md-3">
              <input
                type="text"
                class="form-control form-control-sm"
                :value="attr.name"
                placeholder="attrName"
                @input="updateAttr(bi, ai, 'name', $event.target.value)"
              />
            </div>
            <div class="col-md-3">
              <select
                class="form-control form-control-sm"
                :value="attr.type || 'string'"
                @change="updateAttr(bi, ai, 'type', $event.target.value)"
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="integer">integer</option>
                <option value="boolean">boolean</option>
                <option value="array">array</option>
                <option value="object">object</option>
                <option value="null">null</option>
              </select>
            </div>
            <div class="col-md-4">
              <input
                type="text"
                class="form-control form-control-sm"
                :value="attr.default"
                placeholder="default value"
                @input="updateAttr(bi, ai, 'default', $event.target.value)"
              />
            </div>
            <div class="col-md-2 text-right">
              <button
                type="button"
                class="btn btn-xs btn-outline-danger"
                @click="removeAttr(bi, ai)"
              >
                &times;
              </button>
            </div>
          </div>
        </div>

        <hr v-if="bi < blocks.length - 1" class="mt-3" />
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="addBlock">
          + Add Block
        </button>
      </div>
    </card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import card from '../card';
import ToggleInput from '@/components/Common/ToggleInput';
import AutocompleteInput from '@/components/Common/AutocompleteInput';

export default {
  name: 'BlocksSection',
  components: { card, ToggleInput, AutocompleteInput },
  computed: {
    ...mapGetters(['blocks']),
  },
  methods: {
    addBlock() { this.$store.dispatch('addBlock'); },
    removeBlock(bi) { this.$store.dispatch('removeBlock', { index: bi }); },
    update(bi, key, value) { this.$store.dispatch('setBlockData', { index: bi, key, value }); },

    addAttr(bi) { this.$store.dispatch('addBlockAttr', { blockIndex: bi }); },
    removeAttr(bi, ai) { this.$store.dispatch('removeBlockAttr', { blockIndex: bi, attrIndex: ai }); },
    updateAttr(bi, ai, key, value) {
      this.$store.dispatch('setBlockAttrData', { blockIndex: bi, attrIndex: ai, key, value });
    },
  },
};
</script>

<style scoped>
.wpgen-block-item {
  border: 1px solid #c3c4c7;
  border-radius: 4px;
  padding: 14px;
  background: #f9f9f9;
}
.wpgen-sub-panel {
  background: #fff;
  border: 1px solid #e2e4e7;
  border-radius: 3px;
  padding: 10px;
}
.wpgen-empty-state {
  padding: 20px;
  text-align: center;
}
.btn-xs {
  padding: 0.1rem 0.4rem;
  font-size: 0.75rem;
}
</style>
