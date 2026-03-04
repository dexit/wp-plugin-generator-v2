<template>
  <div class="wpgen-autocomplete" :class="{ 'is-open': isOpen }">
    <input
      ref="input"
      type="text"
      :value="value"
      :placeholder="placeholder"
      :class="inputClass"
      autocomplete="off"
      role="combobox"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-autocomplete="list"
      :aria-label="label"
      @input="onInput"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
    />

    <!-- Icon preview for dashicons -->
    <span
      v-if="contextKey === 'menuIcon' && value && value.startsWith('dashicons-')"
      class="wpgen-icon-preview dashicons"
      :class="value"
      :title="value"
    ></span>

    <ul
      v-if="isOpen && filteredSuggestions.length"
      class="wpgen-suggestions"
      role="listbox"
    >
      <li
        v-for="(s, i) in filteredSuggestions"
        :key="s"
        role="option"
        :class="{ 'is-active': i === activeIndex }"
        @mousedown.prevent="selectSuggestion(s)"
      >
        <span
          v-if="contextKey === 'menuIcon' && s.startsWith('dashicons-')"
          class="dashicons suggestion-icon"
          :class="s"
        ></span>
        {{ s }}
      </li>
    </ul>
  </div>
</template>

<script>
import { getSuggestions } from '../../utils/wp-autocomplete';

export default {
  name: 'AutocompleteInput',
  props: {
    value: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    /** One of the keys in WP_CONTEXT_MAP for built-in suggestions. */
    contextKey: {
      type: String,
      default: '',
    },
    /** Extra custom suggestions to merge with context ones. */
    extraSuggestions: {
      type: Array,
      default: () => [],
    },
    inputClass: {
      type: String,
      default: 'form-control',
    },
    maxSuggestions: {
      type: Number,
      default: 12,
    },
  },
  data() {
    return {
      isOpen:      false,
      activeIndex: -1,
    };
  },
  computed: {
    filteredSuggestions() {
      const fromContext = this.contextKey
        ? getSuggestions(this.contextKey, this.value)
        : [];
      const merged = [
        ...new Set([...fromContext, ...this.extraSuggestions]),
      ].filter((s) =>
        !this.value || s.toLowerCase().includes(this.value.toLowerCase())
      );
      return merged.slice(0, this.maxSuggestions);
    },
  },
  methods: {
    onInput(e) {
      this.$emit('input', e.target.value);
      this.activeIndex = -1;
      this.isOpen = true;
    },
    onFocus() {
      this.isOpen = this.filteredSuggestions.length > 0;
    },
    onBlur() {
      // Delay so mousedown on a suggestion fires first.
      setTimeout(() => {
        this.isOpen = false;
        this.activeIndex = -1;
      }, 150);
    },
    onKeydown(e) {
      if (!this.isOpen) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.activeIndex = Math.min(
            this.activeIndex + 1,
            this.filteredSuggestions.length - 1
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.activeIndex = Math.max(this.activeIndex - 1, -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (this.activeIndex >= 0) {
            this.selectSuggestion(this.filteredSuggestions[this.activeIndex]);
          }
          break;
        case 'Escape':
          this.isOpen = false;
          this.activeIndex = -1;
          break;
      }
    },
    selectSuggestion(s) {
      this.$emit('input', s);
      this.isOpen = false;
      this.activeIndex = -1;
      this.$refs.input.focus();
    },
  },
};
</script>

<style scoped>
.wpgen-autocomplete {
  position: relative;
  display: flex;
  align-items: center;
}
.wpgen-autocomplete input {
  width: 100%;
}
.wpgen-icon-preview {
  position: absolute;
  right: 8px;
  font-size: 18px;
  color: #555;
  pointer-events: none;
}
.wpgen-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 9999;
  background: #fff;
  border: 1px solid #8c8f94;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 240px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}
.wpgen-suggestions li {
  padding: 6px 10px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.wpgen-suggestions li:hover,
.wpgen-suggestions li.is-active {
  background: #2271b1;
  color: #fff;
}
.suggestion-icon {
  font-size: 16px;
  flex-shrink: 0;
}
</style>
