<template>
  <div class="wpgen-tags-input">
    <div class="tags-container" @click="focusInput">
      <span
        v-for="(tag, i) in tags"
        :key="tag"
        class="tag-badge"
      >
        {{ tag }}
        <button type="button" class="tag-remove" @click.stop="removeTag(i)">
          &times;
        </button>
      </span>
      <span class="tag-input-wrapper">
        <input
          ref="tagInput"
          v-model="inputValue"
          type="text"
          :placeholder="tags.length === 0 ? placeholder : ''"
          :list="listId"
          autocomplete="off"
          class="tag-input"
          @keydown.enter.prevent="addTag"
          @keydown.tab.prevent="addTag"
          @keydown.backspace="onBackspace"
          @keydown.comma.prevent="addTag"
          @blur="addTag"
        />
        <datalist v-if="suggestions.length" :id="listId">
          <option v-for="s in availableSuggestions" :key="s" :value="s" />
        </datalist>
      </span>
    </div>
    <span v-if="helptext" class="form-help d-block mt-1 text-muted small">{{ helptext }}</span>
  </div>
</template>

<script>
export default {
  name: 'TagsInput',
  props: {
    /** Array of currently selected tags (v-model) */
    value: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: 'Type and press Enter…',
    },
    helptext: {
      type: String,
      default: '',
    },
    /** Optional suggestion list */
    suggestions: {
      type: Array,
      default: () => [],
    },
    /** Prevent duplicate tags */
    unique: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      inputValue: '',
      listId: `tags-list-${Math.random().toString(36).substr(2, 8)}`,
    };
  },
  computed: {
    tags() {
      return this.value || [];
    },
    availableSuggestions() {
      const q = this.inputValue.toLowerCase();
      return this.suggestions
        .filter((s) => !q || s.toLowerCase().includes(q))
        .filter((s) => !this.unique || !this.tags.includes(s));
    },
  },
  methods: {
    addTag() {
      const tag = this.inputValue.trim().replace(/,$/, '');
      if (!tag) return;
      if (this.unique && this.tags.includes(tag)) {
        this.inputValue = '';
        return;
      }
      this.$emit('input', [...this.tags, tag]);
      this.inputValue = '';
    },
    removeTag(index) {
      const updated = [...this.tags];
      updated.splice(index, 1);
      this.$emit('input', updated);
    },
    onBackspace() {
      if (this.inputValue === '' && this.tags.length) {
        this.removeTag(this.tags.length - 1);
      }
    },
    focusInput() {
      this.$refs.tagInput.focus();
    },
  },
};
</script>

<style scoped>
.wpgen-tags-input {
  width: 100%;
}
.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-height: 38px;
  border: 1px solid #8c8f94;
  border-radius: 4px;
  padding: 4px 8px;
  background: #fff;
  cursor: text;
  transition: border-color 0.15s;
}
.tags-container:focus-within {
  border-color: #2271b1;
  box-shadow: 0 0 0 1px #2271b1;
}
.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #2271b1;
  color: #fff;
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 1.4;
}
.tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  opacity: 0.8;
}
.tag-remove:hover {
  opacity: 1;
}
.tag-input-wrapper {
  flex: 1;
  min-width: 80px;
}
.tag-input {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  width: 100%;
  font-size: 13px;
  background: transparent;
}
</style>
