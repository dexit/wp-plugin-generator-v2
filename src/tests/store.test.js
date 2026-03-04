/**
 * Vitest tests for the Zustand store (useStore).
 *
 * Tests:
 * 1. Initial state matches DEFAULT_STATE
 * 2. setGeneral updates general.pluginName
 * 3. autofillFromName returns correct textDomain, toPascalCase, etc.
 * 4. addCpt adds a CPT, removeCpt removes it
 * 5. undo/redo: modify something, undo reverts, redo re-applies
 * 6. exportConfig returns valid JSON
 * 7. importConfig restores state from JSON
 * 8. resetAll returns to DEFAULT_STATE
 * 9. WIZARD_STEPS has 11 items
 */

import { describe, it, expect, beforeEach } from 'vitest';
import useStore, { DEFAULT_STATE, WIZARD_STEPS } from '../store/useStore';
import { autofillFromName, toSlug, toPascalCase, toUpperSnake, toLowerSnake } from '../utils/helpers';

// Helper to get a fresh store state snapshot
const getState = () => useStore.getState();

// Reset store before each test
beforeEach(() => {
  getState().resetAll();
});

// ── 1. Initial state ──────────────────────────────────────────────────────────

describe('Store initial state', () => {
  it('matches DEFAULT_STATE for general settings', () => {
    const { general } = getState();
    expect(general.pluginName).toBe(DEFAULT_STATE.general.pluginName);
    expect(general.textDomain).toBe(DEFAULT_STATE.general.textDomain);
    expect(general.version).toBe(DEFAULT_STATE.general.version);
  });

  it('has empty arrays for cpts, blocks, emails, etc.', () => {
    const s = getState();
    expect(s.cpts).toEqual([]);
    expect(s.blocks).toEqual([]);
    expect(s.emails).toEqual([]);
    expect(s.metaBoxes).toEqual([]);
    expect(s.restCallbacks).toEqual([]);
    expect(s.settingsGroups).toEqual([]);
    expect(s.options).toEqual([]);
    expect(s.tables).toEqual([]);
  });

  it('starts at step 0', () => {
    expect(getState().currentStep).toBe(0);
  });
});

// ── 2. setGeneral ─────────────────────────────────────────────────────────────

describe('setGeneral', () => {
  it('updates general.pluginName', () => {
    getState().setGeneral('pluginName', 'Test Plugin');
    expect(getState().general.pluginName).toBe('Test Plugin');
  });

  it('updates general.version', () => {
    getState().setGeneral('version', '2.0.0');
    expect(getState().general.version).toBe('2.0.0');
  });
});

// ── 3. autofillFromName ───────────────────────────────────────────────────────

describe('autofillFromName helper', () => {
  it('returns correct textDomain for "My Events Plugin"', () => {
    const result = autofillFromName('My Events Plugin');
    expect(result.textDomain).toBe('my-events-plugin');
  });

  it('returns PascalCase mainClassName', () => {
    const result = autofillFromName('My Events Plugin');
    expect(result.mainClassName).toBe('MyEventsPlugin');
  });

  it('returns UPPER_SNAKE constantPrefix', () => {
    const result = autofillFromName('My Events Plugin');
    expect(result.constantPrefix).toBe('MY_EVENTS_PLUGIN');
  });

  it('returns lower_snake functionPrefix', () => {
    const result = autofillFromName('My Events Plugin');
    expect(result.functionPrefix).toBe('my_events_plugin');
  });

  it('returns PascalCase baseNamespace', () => {
    const result = autofillFromName('My Events Plugin');
    expect(result.baseNamespace).toBe('MyEventsPlugin');
  });

  it('returns empty object for empty string', () => {
    expect(autofillFromName('')).toEqual({});
    expect(autofillFromName(null)).toEqual({});
    expect(autofillFromName(undefined)).toEqual({});
  });
});

// ── 4. addCpt / removeCpt ────────────────────────────────────────────────────

describe('addCpt / removeCpt', () => {
  it('adds a CPT', () => {
    getState().addCpt();
    expect(getState().cpts).toHaveLength(1);
  });

  it('added CPT has expected default fields', () => {
    getState().addCpt();
    const cpt = getState().cpts[0];
    expect(cpt).toHaveProperty('postType');
    expect(cpt).toHaveProperty('singular');
    expect(cpt).toHaveProperty('showInRest');
    expect(Array.isArray(cpt.supports)).toBe(true);
  });

  it('adds multiple CPTs', () => {
    getState().addCpt();
    getState().addCpt();
    expect(getState().cpts).toHaveLength(2);
  });

  it('removes a CPT by index', () => {
    getState().addCpt();
    getState().addCpt();
    getState().removeCpt(0);
    expect(getState().cpts).toHaveLength(1);
  });

  it('setCptData updates the correct field', () => {
    getState().addCpt();
    getState().setCptData(0, 'singular', 'Event');
    expect(getState().cpts[0].singular).toBe('Event');
  });
});

// ── 5. undo / redo ───────────────────────────────────────────────────────────

describe('undo / redo', () => {
  it('undo reverts a setGeneral change', () => {
    const original = getState().general.pluginName;
    getState().setGeneral('pluginName', 'Modified Name');
    expect(getState().general.pluginName).toBe('Modified Name');
    getState().undo();
    expect(getState().general.pluginName).toBe(original);
  });

  it('redo re-applies after undo', () => {
    getState().setGeneral('pluginName', 'Modified Name');
    getState().undo();
    getState().redo();
    expect(getState().general.pluginName).toBe('Modified Name');
  });

  it('_historySize.past increases after changes', () => {
    expect(getState()._historySize.past).toBe(0);
    getState().setGeneral('version', '1.0.1');
    expect(getState()._historySize.past).toBeGreaterThan(0);
  });

  it('undo on empty history does nothing', () => {
    // Should not throw
    expect(() => getState().undo()).not.toThrow();
  });
});

// ── 6. exportConfig ───────────────────────────────────────────────────────────

describe('exportConfig', () => {
  it('returns a string', () => {
    const json = getState().exportConfig();
    expect(typeof json).toBe('string');
  });

  it('is valid JSON', () => {
    const json = getState().exportConfig();
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes the general object', () => {
    const parsed = JSON.parse(getState().exportConfig());
    expect(parsed).toHaveProperty('general');
  });

  it('includes _version field', () => {
    const parsed = JSON.parse(getState().exportConfig());
    expect(parsed).toHaveProperty('_version');
  });

  it('exported cpts reflect current state', () => {
    getState().addCpt();
    getState().setCptData(0, 'postType', 'event');
    const parsed = JSON.parse(getState().exportConfig());
    expect(parsed.cpts).toHaveLength(1);
    expect(parsed.cpts[0].postType).toBe('event');
  });
});

// ── 7. importConfig ───────────────────────────────────────────────────────────

describe('importConfig', () => {
  it('restores general from JSON', () => {
    const config = {
      general: {
        ...DEFAULT_STATE.general,
        pluginName: 'Imported Plugin',
        textDomain: 'imported-plugin',
      },
      cpts: [],
    };
    getState().importConfig(JSON.stringify(config));
    expect(getState().general.pluginName).toBe('Imported Plugin');
    expect(getState().general.textDomain).toBe('imported-plugin');
  });

  it('restores cpts from JSON', () => {
    const config = {
      cpts: [{ postType: 'event', singular: 'Event', plural: 'Events' }],
    };
    getState().importConfig(JSON.stringify(config));
    expect(getState().cpts).toHaveLength(1);
    expect(getState().cpts[0].postType).toBe('event');
  });

  it('throws on invalid JSON', () => {
    expect(() => getState().importConfig('not-json')).toThrow();
  });
});

// ── 8. resetAll ───────────────────────────────────────────────────────────────

describe('resetAll', () => {
  it('returns to DEFAULT_STATE general settings', () => {
    getState().setGeneral('pluginName', 'Modified');
    getState().addCpt();
    getState().resetAll();
    expect(getState().general.pluginName).toBe(DEFAULT_STATE.general.pluginName);
  });

  it('clears cpts', () => {
    getState().addCpt();
    getState().addCpt();
    getState().resetAll();
    expect(getState().cpts).toEqual([]);
  });

  it('clears blocks', () => {
    getState().addBlock();
    getState().resetAll();
    expect(getState().blocks).toEqual([]);
  });
});

// ── 9. WIZARD_STEPS ──────────────────────────────────────────────────────────

describe('WIZARD_STEPS', () => {
  it('has exactly 11 items', () => {
    expect(WIZARD_STEPS).toHaveLength(11);
  });

  it('first step is "general"', () => {
    expect(WIZARD_STEPS[0].id).toBe('general');
  });

  it('last step is "review"', () => {
    expect(WIZARD_STEPS[WIZARD_STEPS.length - 1].id).toBe('review');
  });

  it('each step has id, label, icon, description', () => {
    WIZARD_STEPS.forEach((step) => {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('label');
      expect(step).toHaveProperty('icon');
      expect(step).toHaveProperty('description');
    });
  });
});
