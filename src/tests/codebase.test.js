/**
 * Codebase generator integration tests.
 * Smoke-tests every generator to ensure they return non-empty strings
 * and contain expected PHP/JS boilerplate.
 */
import { describe, it, expect } from 'vitest';
import { CodeBase } from '../codebase/index.js';

// ─── Minimal valid plugin data ────────────────────────────────────────────────

const BASE = {
  pluginName:     'Test Plugin',
  pluginURI:      'https://example.com',
  description:    'A test plugin.',
  version:        '1.0.0',
  author:         'Test Author',
  authorURI:      'https://example.com',
  authorEmail:    'test@example.com',
  license:        'GPL-2.0-or-later',
  licenseURI:     'https://www.gnu.org/licenses/gpl-2.0.html',
  textDomain:     'test-plugin',
  domainPath:     '/languages',
  mainClassName:  'TestPlugin',
  baseNamespace:  'TestPlugin',
  constantPrefix: 'TEST_PLUGIN',
  functionPrefix: 'test_plugin',
};

const SAMPLE_CPT = {
  postType: 'event', singular: 'Event', plural: 'Events', description: 'An event post type.',
  menuIcon: 'dashicons-calendar-alt', menuPosition: 5,
  capabilityType: 'post', urlSlug: 'events', className: 'Event_CPT',
  showInRest: true, hasArchive: true, hierarchical: false, isPublic: true,
  supports: ['title', 'editor'], taxonomies: 'event_category,event_tag',
};

const SAMPLE_TABLE = {
  name: 'test_events',
  fields: [
    { name: 'id',         type: 'INT',     length: 11,  null: false, default: '' },
    { name: 'event_name', type: 'VARCHAR', length: 255, null: false, default: '' },
  ],
  restapi: [],
  settings: {},
};

const SAMPLE_REST = {
  namespace: 'test-plugin/v1',
  route:     '/events',
  methods:   ['GET', 'POST'],
  fields:    [],
};

const SAMPLE_SETTINGS = {
  namespace: 'test-plugin/v1',
  route:     '/events',
  methods:   ['GET'],
};

const SAMPLE_META_BOX = {
  id: 'event_details', title: 'Event Details', postTypes: ['event'],
  context: 'normal', priority: 'high',
  fields: [{ key: '_event_date', label: 'Date', type: 'date', description: '' }],
};

const SAMPLE_CALLBACK = {
  namespace: 'test-plugin/v1', route: '/events', className: 'Events_Controller',
  methods: ['GET', 'POST'], capability: 'read', authRequired: false,
};

const SAMPLE_USER_FIELD = { key: 'em_role', label: 'Event Role', type: 'text', section: 'Events', description: '' };

const SAMPLE_TERM_GROUP = {
  taxonomy: 'event_category',
  fields: [{ key: '_cat_color', label: 'Color', type: 'color', description: '' }],
};

const SAMPLE_QE = {
  postType: 'event',
  fields: [{ key: '_event_date', label: 'Date', type: 'date' }],
};

const SAMPLE_BE = {
  postType: 'event',
  actions: [{ slug: 'mark_featured', label: 'Mark Featured' }],
};

const SAMPLE_POST_REST_FIELD = {
  fieldName: 'event_date', postTypes: ['event'], type: 'string', description: 'Event date.', readonly: false,
};

const SAMPLE_EMAIL = {
  method: 'send_confirmation', subject: 'Booking Confirmed', template: 'confirmation.php',
  recipientType: 'user', html: true, attachments: false,
};

const SAMPLE_IMPORTER = {
  id: 'event_importer', name: 'Event Importer', description: 'Import events from CSV.',
  className: 'Event_Importer', fileTypes: '.csv',
};

const SAMPLE_BLOCK = {
  name: 'event-card', title: 'Event Card', category: 'common', icon: 'dashicons-calendar-alt',
  description: 'Event card block.', keywords: 'event',
  dynamic: true,
  supportsAnchor: false, supportsAlign: true, supportsColor: true,
  supportsTypo: false, supportsSpacing: false, supportsClassName: true,
  attributes: [{ name: 'eventId', type: 'number', default: '0' }],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const isString = (v) => typeof v === 'string' && v.length > 0;
const hasPhpTag = (v) => v.includes('<?php');
const hasNS    = (v) => v.includes('TestPlugin');

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CodeBase generators', () => {

  describe('mainPluginCode', () => {
    it('returns a non-empty string with PHP open tag', () => {
      const out = CodeBase.mainPluginCode(BASE);
      expect(isString(out)).toBe(true);
      expect(hasPhpTag(out)).toBe(true);
    });
    it('contains plugin name and namespace', () => {
      const out = CodeBase.mainPluginCode(BASE);
      expect(out).toContain('Test Plugin');
      expect(out).toContain('TestPlugin');
    });
    it('includes PHP 8.2+ header', () => {
      const out = CodeBase.mainPluginCode(BASE);
      expect(out).toContain('Requires PHP');
    });
  });

  describe('assetsCode', () => {
    it('returns valid PHP', () => {
      const out = CodeBase.assetsCode(BASE, { css: [], js: [] });
      expect(isString(out)).toBe(true);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('composerCode', () => {
    it('returns valid JSON', () => {
      const out = CodeBase.composerCode(BASE);
      expect(isString(out)).toBe(true);
      expect(() => JSON.parse(out)).not.toThrow();
    });
    it('contains namespace', () => {
      const parsed = JSON.parse(CodeBase.composerCode(BASE));
      const ns = Object.keys(parsed.autoload?.['psr-4'] || {})[0];
      expect(ns).toContain('TestPlugin');
    });
  });

  describe('installerCode', () => {
    it('returns PHP with table creation SQL', () => {
      const out = CodeBase.installerCode(BASE, [SAMPLE_TABLE]);
      expect(hasPhpTag(out)).toBe(true);
      expect(out).toContain('CREATE TABLE');
    });
  });

  describe('functionsCode', () => {
    it('returns PHP', () => {
      const out = CodeBase.functionsCode(BASE, [SAMPLE_TABLE]);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('adminCode', () => {
    it('returns PHP', () => {
      const out = CodeBase.adminCode(BASE, [SAMPLE_TABLE]);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('restapiCode', () => {
    it('returns PHP with WP_REST_Controller', () => {
      const out = CodeBase.restapiCode(BASE, SAMPLE_REST, SAMPLE_SETTINGS, true);
      expect(hasPhpTag(out)).toBe(true);
      expect(out).toContain('WP_REST_Controller');
    });
    it('uses comma-separated HTTP methods (not pipe)', () => {
      const out = CodeBase.restapiCode(BASE, SAMPLE_REST, SAMPLE_SETTINGS, true);
      expect(out).not.toContain("'GET' | 'POST'");
    });
  });

  describe('menuCode', () => {
    it('returns PHP', () => {
      const out = CodeBase.menuCode(BASE, [SAMPLE_TABLE], { menuTitle: 'Test', pageTitle: 'Test', capability: 'manage_options', pageSlug: 'test' });
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('gitIgnoreCode', () => {
    it('returns .gitignore content', () => {
      const out = CodeBase.gitIgnoreCode();
      expect(isString(out)).toBe(true);
      expect(out).toContain('node_modules');
    });
  });

  describe('editorconfigCode', () => {
    it('returns editorconfig content', () => {
      const out = CodeBase.editorconfigCode();
      expect(isString(out)).toBe(true);
      expect(out).toContain('indent_style');
    });
  });

  describe('phpcsCode', () => {
    it('returns PHPCS ruleset XML', () => {
      const out = CodeBase.phpcsCode();
      expect(isString(out)).toBe(true);
      expect(out).toContain('ruleset');
    });
  });

  describe('readmeCode', () => {
    it('contains plugin name', () => {
      const out = CodeBase.readmeCode(BASE);
      expect(out).toContain('Test Plugin');
    });
  });

  // ── New generators ──────────────────────────────────────────────────────────

  describe('cptCode', () => {
    it('returns PHP with register_post_type', () => {
      const out = CodeBase.cptCode(BASE, [SAMPLE_CPT]);
      expect(hasPhpTag(out)).toBe(true);
      expect(out).toContain('register_post_type');
    });
    it('includes CPT slug', () => {
      const out = CodeBase.cptCode(BASE, [SAMPLE_CPT]);
      expect(out).toContain('event');
    });
  });

  describe('settingsCode', () => {
    it('returns PHP', () => {
      const group = {
        groupId: 'test_settings', title: 'Test Settings', pageSlug: 'test-settings',
        capability: 'manage_options',
        sections: [{
          id: 'general', title: 'General', description: '',
          fields: [{ id: 'test_field', label: 'Test', type: 'text', default: '', description: '' }],
        }],
      };
      const out = CodeBase.settingsCode(BASE, [group]);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('metaBoxCode', () => {
    it('returns PHP with add_meta_box', () => {
      const out = CodeBase.metaBoxCode(BASE, [SAMPLE_META_BOX]);
      expect(hasPhpTag(out)).toBe(true);
      expect(out).toContain('add_meta_box');
    });
  });

  describe('screenOptionsCode', () => {
    it('returns PHP', () => {
      const opt = { screen: 'edit-event', option: 'em_per_page', label: 'Per page', default: 20, type: 'per_page' };
      const out = CodeBase.screenOptionsCode(BASE, [opt]);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('restCallbackCode', () => {
    it('returns PHP with WP_REST_Controller', () => {
      const out = CodeBase.restCallbackCode(BASE, [SAMPLE_CALLBACK]);
      expect(hasPhpTag(out)).toBe(true);
      expect(out).toContain('WP_REST_Controller');
    });
    it('uses comma-separated methods (fixed QA bug)', () => {
      const out = CodeBase.restCallbackCode(BASE, [SAMPLE_CALLBACK]);
      // Should be 'GET, POST' not 'GET | POST'
      expect(out).not.toMatch(/'GET'\s*\|\s*'POST'/);
    });
  });

  describe('userFieldsCode', () => {
    it('returns PHP', () => {
      const out = CodeBase.userFieldsCode(BASE, [SAMPLE_USER_FIELD]);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('termFieldsCode', () => {
    it('returns PHP', () => {
      const out = CodeBase.termFieldsCode(BASE, [SAMPLE_TERM_GROUP]);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('quickEditCode', () => {
    it('returns PHP', () => {
      const out = CodeBase.quickEditCode(BASE, [SAMPLE_QE]);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('bulkEditCode', () => {
    it('returns PHP', () => {
      const out = CodeBase.bulkEditCode(BASE, [SAMPLE_BE]);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('postRestFieldsCode', () => {
    it('returns PHP with register_rest_field', () => {
      const out = CodeBase.postRestFieldsCode(BASE, [SAMPLE_POST_REST_FIELD]);
      expect(hasPhpTag(out)).toBe(true);
      expect(out).toContain('register_rest_field');
    });
  });

  describe('requestUtilsCode', () => {
    it('returns PHP', () => {
      const out = CodeBase.requestUtilsCode(BASE);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('dbUtilsCode', () => {
    it('returns PHP', () => {
      const out = CodeBase.dbUtilsCode(BASE);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('emailCode', () => {
    it('returns PHP', () => {
      const out = CodeBase.emailCode(BASE, [SAMPLE_EMAIL]);
      expect(hasPhpTag(out)).toBe(true);
    });
  });

  describe('importerCode', () => {
    it('returns PHP with WP_Importer', () => {
      const out = CodeBase.importerCode(BASE, [SAMPLE_IMPORTER]);
      expect(hasPhpTag(out)).toBe(true);
      expect(out).toContain('WP_Importer');
    });
    it('includes capability check (QA fix)', () => {
      const out = CodeBase.importerCode(BASE, [SAMPLE_IMPORTER]);
      expect(out).toContain("current_user_can( 'import' )");
    });
  });

  describe('blocksPhpCode', () => {
    it('returns PHP with register_block_type', () => {
      const out = CodeBase.blocksPhpCode(BASE, [SAMPLE_BLOCK]);
      expect(hasPhpTag(out)).toBe(true);
      expect(out).toContain('register_block_type');
    });
  });

  describe('blocksPackageJson', () => {
    it('returns valid JSON with @wordpress/scripts', () => {
      const out = CodeBase.blocksPackageJson(BASE);
      expect(isString(out)).toBe(true);
      const parsed = JSON.parse(out);
      expect(parsed.devDependencies['@wordpress/scripts']).toBeDefined();
    });
  });

  describe('allBlockFiles', () => {
    it('returns an object with multiple file entries', () => {
      const out = CodeBase.allBlockFiles(BASE, [SAMPLE_BLOCK]);
      expect(typeof out).toBe('object');
      expect(Object.keys(out).length).toBeGreaterThan(0);
    });
  });

});
