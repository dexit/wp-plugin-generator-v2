/**
 * Vitest tests for validateState().
 *
 * Tests:
 * 1. Empty state has errors for gen-name, gen-td, gen-ns
 * 2. No-cpts warning present when cpts is empty
 * 3. CPT with showInRest but no REST callback generates warning
 * 4. REST callback without namespace generates error
 * 5. Block without name generates error
 * 6. Valid full state has 0 errors
 */

import { describe, it, expect } from 'vitest';
import { validateState, DEFAULT_STATE } from '../store/useStore';

// Helper to build a partial state merged with DEFAULT_STATE
const makeState = (overrides = {}) => ({
  ...DEFAULT_STATE,
  ...overrides,
  general: { ...DEFAULT_STATE.general, ...(overrides.general || {}) },
});

// ── 1. Empty / bare general state ────────────────────────────────────────────

describe('validateState — empty general', () => {
  it('has error for missing plugin name (gen-name)', () => {
    const state = makeState({ general: { ...DEFAULT_STATE.general, pluginName: '' } });
    const warnings = validateState(state);
    const ids = warnings.map((w) => w.id);
    expect(ids).toContain('gen-name');
  });

  it('error for gen-name has level="error"', () => {
    const state = makeState({ general: { ...DEFAULT_STATE.general, pluginName: '' } });
    const warnings = validateState(state);
    const w = warnings.find((w) => w.id === 'gen-name');
    expect(w).toBeDefined();
    expect(w.level).toBe('error');
  });

  it('has error for missing text domain (gen-td)', () => {
    const state = makeState({ general: { ...DEFAULT_STATE.general, textDomain: '' } });
    const warnings = validateState(state);
    const ids = warnings.map((w) => w.id);
    expect(ids).toContain('gen-td');
  });

  it('has error for missing base namespace (gen-ns)', () => {
    const state = makeState({ general: { ...DEFAULT_STATE.general, baseNamespace: '' } });
    const warnings = validateState(state);
    const ids = warnings.map((w) => w.id);
    expect(ids).toContain('gen-ns');
  });
});

// ── 2. No CPTs warning ────────────────────────────────────────────────────────

describe('validateState — no CPTs warning', () => {
  it('warns when cpts array is empty', () => {
    const state = makeState({ cpts: [] });
    const warnings = validateState(state);
    const ids = warnings.map((w) => w.id);
    expect(ids).toContain('no-cpts');
  });

  it('no-cpts warning has level="warning"', () => {
    const state = makeState({ cpts: [] });
    const w = validateState(state).find((w) => w.id === 'no-cpts');
    expect(w).toBeDefined();
    expect(w.level).toBe('warning');
  });

  it('no-cpts warning is NOT present when there is at least one CPT', () => {
    const state = makeState({
      cpts: [{ postType: 'event', singular: 'Event', plural: 'Events', showInRest: false, taxonomies: '' }],
    });
    const ids = validateState(state).map((w) => w.id);
    expect(ids).not.toContain('no-cpts');
  });
});

// ── 3. CPT showInRest without REST callback ───────────────────────────────────

describe('validateState — CPT showInRest without REST callback', () => {
  it('generates a warning for CPT with showInRest=true and no matching REST callback', () => {
    const state = makeState({
      cpts: [{ postType: 'event', singular: 'Event', plural: 'Events', showInRest: true, taxonomies: '' }],
      restCallbacks: [],
    });
    const warnings = validateState(state);
    const ids = warnings.map((w) => w.id);
    expect(ids).toContain('cpt-0-rest');
  });

  it('warning level for cpt-0-rest is "warning"', () => {
    const state = makeState({
      cpts: [{ postType: 'event', singular: 'Event', plural: 'Events', showInRest: true, taxonomies: '' }],
      restCallbacks: [],
    });
    const w = validateState(state).find((w) => w.id === 'cpt-0-rest');
    expect(w).toBeDefined();
    expect(w.level).toBe('warning');
  });

  it('does NOT warn when a matching REST callback route exists', () => {
    const state = makeState({
      cpts: [{ postType: 'event', singular: 'Event', plural: 'Events', showInRest: true, taxonomies: '' }],
      restCallbacks: [{ namespace: 'my-plugin/v1', route: '/events', methods: ['GET'], capability: 'read', authRequired: false }],
    });
    const ids = validateState(state).map((w) => w.id);
    expect(ids).not.toContain('cpt-0-rest');
  });

  it('does NOT warn for CPT with showInRest=false', () => {
    const state = makeState({
      cpts: [{ postType: 'event', singular: 'Event', plural: 'Events', showInRest: false, taxonomies: '' }],
      restCallbacks: [],
    });
    const ids = validateState(state).map((w) => w.id);
    expect(ids).not.toContain('cpt-0-rest');
  });
});

// ── 4. REST callback without namespace ───────────────────────────────────────

describe('validateState — REST callback without namespace', () => {
  it('generates an error for REST callback missing namespace', () => {
    const state = makeState({
      restCallbacks: [{ namespace: '', route: '/events', methods: ['GET'], capability: 'read', authRequired: false }],
    });
    const warnings = validateState(state);
    const ids = warnings.map((w) => w.id);
    expect(ids).toContain('rc-0-ns');
  });

  it('error level for rc-0-ns is "error"', () => {
    const state = makeState({
      restCallbacks: [{ namespace: '', route: '/events', methods: ['GET'], capability: 'read', authRequired: false }],
    });
    const w = validateState(state).find((w) => w.id === 'rc-0-ns');
    expect(w).toBeDefined();
    expect(w.level).toBe('error');
  });

  it('also errors when route is missing', () => {
    const state = makeState({
      restCallbacks: [{ namespace: 'my-plugin/v1', route: '', methods: ['GET'], capability: 'read', authRequired: false }],
    });
    const ids = validateState(state).map((w) => w.id);
    expect(ids).toContain('rc-0-route');
  });

  it('no REST callback errors when namespace and route are set', () => {
    const state = makeState({
      restCallbacks: [{ namespace: 'my-plugin/v1', route: '/events', methods: ['GET'], capability: 'read', authRequired: false }],
    });
    const ids = validateState(state).map((w) => w.id);
    expect(ids).not.toContain('rc-0-ns');
    expect(ids).not.toContain('rc-0-route');
  });
});

// ── 5. Block without name ─────────────────────────────────────────────────────

describe('validateState — block without name', () => {
  it('generates an error for block missing a slug', () => {
    const state = makeState({
      blocks: [{ name: '', title: 'My Block', category: 'common', attributes: [] }],
    });
    const warnings = validateState(state);
    const ids = warnings.map((w) => w.id);
    expect(ids).toContain('bl-0-name');
  });

  it('error level for bl-0-name is "error"', () => {
    const state = makeState({
      blocks: [{ name: '', title: 'My Block', category: 'common', attributes: [] }],
    });
    const w = validateState(state).find((w) => w.id === 'bl-0-name');
    expect(w).toBeDefined();
    expect(w.level).toBe('error');
  });

  it('no block name error when name is set', () => {
    const state = makeState({
      blocks: [{ name: 'my-block', title: 'My Block', category: 'common', attributes: [] }],
    });
    const ids = validateState(state).map((w) => w.id);
    expect(ids).not.toContain('bl-0-name');
  });
});

// ── 6. Valid full state has 0 errors ─────────────────────────────────────────

describe('validateState — valid full state', () => {
  it('has zero errors for a complete valid state', () => {
    const state = makeState({
      general: {
        pluginName:     'Events Manager',
        pluginURI:      'https://example.com',
        description:    'A great plugin.',
        version:        '1.0.0',
        author:         'Dev',
        authorURI:      'https://example.com',
        authorEmail:    'dev@example.com',
        license:        'GPL-2.0-or-later',
        licenseURI:     'https://www.gnu.org/licenses/gpl-2.0.html',
        textDomain:     'events-manager',
        domainPath:     '/languages',
        mainClassName:  'EventsManager',
        baseNamespace:  'EventsManager',
        constantPrefix: 'EVENTS_MANAGER',
        functionPrefix: 'events_manager',
      },
      cpts: [
        { postType: 'event', singular: 'Event', plural: 'Events', showInRest: true, taxonomies: '' },
      ],
      restCallbacks: [
        { namespace: 'events-manager/v1', route: '/events', methods: ['GET'], capability: 'read', authRequired: false },
      ],
      metaBoxes: [
        { id: 'event_details', title: 'Event Details', postTypes: ['event'], context: 'normal', priority: 'default', fields: [] },
      ],
      blocks: [
        { name: 'event-card', title: 'Event Card', category: 'common', attributes: [] },
      ],
      settingsGroups: [
        { groupId: 'my_settings', title: 'Settings', pageSlug: 'my-settings', capability: 'manage_options', sections: [] },
      ],
    });

    const errors = validateState(state).filter((w) => w.level === 'error');
    expect(errors).toHaveLength(0);
  });
});
