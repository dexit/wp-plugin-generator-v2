/**
 * Example Solution preset for the WP Plugin Generator.
 * Demonstrates a comprehensive Events Manager plugin.
 */
const exampleSolution = {
  general: {
    pluginName:     'Events Manager',
    pluginURI:      'https://example.com/events-manager',
    description:    'A comprehensive events management plugin with REST API, Gutenberg blocks, and full admin UI.',
    version:        '1.0.0',
    author:         'Your Agency',
    authorURI:      'https://example.com',
    authorEmail:    'hello@example.com',
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
    {
      postType:       'event',
      singular:       'Event',
      plural:         'Events',
      description:    'Events for the events calendar.',
      menuIcon:       'dashicons-calendar-alt',
      menuPosition:   5,
      capabilityType: 'post',
      urlSlug:        'events',
      className:      'Event_CPT',
      showInRest:     true,
      hasArchive:     true,
      hierarchical:   false,
      isPublic:       true,
      supports:       ['title', 'editor', 'thumbnail', 'excerpt'],
      taxonomies:     'event_category,event_tag',
      blockTemplate:  false,
    },
    {
      postType:       'venue',
      singular:       'Venue',
      plural:         'Venues',
      description:    'Venues where events take place.',
      menuIcon:       'dashicons-location',
      menuPosition:   6,
      capabilityType: 'post',
      urlSlug:        'venues',
      className:      'Venue_CPT',
      showInRest:     true,
      hasArchive:     false,
      hierarchical:   false,
      isPublic:       true,
      supports:       ['title', 'editor', 'thumbnail'],
      taxonomies:     'venue_type',
      blockTemplate:  false,
    },
  ],

  metaBoxes: [
    {
      id:        'event_details',
      title:     'Event Details',
      postTypes: ['event'],
      context:   'normal',
      priority:  'high',
      fields: [
        { key: '_event_date',  label: 'Event Date',   type: 'date',   description: 'The date of the event.' },
        { key: '_event_time',  label: 'Event Time',   type: 'text',   description: 'Start time (e.g. 09:00).' },
        { key: '_event_price', label: 'Ticket Price', type: 'number', description: 'Leave 0 for free.' },
        { key: '_event_venue', label: 'Venue ID',     type: 'number', description: 'ID of linked venue post.' },
        { key: '_event_seats', label: 'Max Seats',    type: 'number', description: 'Maximum attendees.' },
        { key: '_event_url',   label: 'Booking URL',  type: 'url',    description: 'External booking link.' },
      ],
    },
    {
      id:        'venue_details',
      title:     'Venue Details',
      postTypes: ['venue'],
      context:   'normal',
      priority:  'high',
      fields: [
        { key: '_venue_address',  label: 'Address',   type: 'text',   description: 'Full street address.' },
        { key: '_venue_city',     label: 'City',      type: 'text',   description: '' },
        { key: '_venue_capacity', label: 'Capacity',  type: 'number', description: 'Max event capacity.' },
        { key: '_venue_lat',      label: 'Latitude',  type: 'text',   description: 'Map latitude.' },
        { key: '_venue_lng',      label: 'Longitude', type: 'text',   description: 'Map longitude.' },
      ],
    },
  ],

  settingsGroups: [
    {
      groupId:    'events_manager_settings',
      title:      'Events Manager Settings',
      pageSlug:   'events-manager-settings',
      capability: 'manage_options',
      sections: [
        {
          id:          'general_section',
          title:       'General Settings',
          description: 'Configure general plugin behaviour.',
          fields: [
            { id: 'em_date_format',  label: 'Date Format',  type: 'text',   default: 'd/m/Y', description: 'PHP date format string.' },
            { id: 'em_currency',     label: 'Currency',     type: 'select', default: 'GBP',   description: 'Default currency for ticket prices.' },
            { id: 'em_email_from',   label: 'From Email',   type: 'email',  default: '',      description: 'Confirmation email sender address.' },
            { id: 'em_archive_slug', label: 'Archive Slug', type: 'text',   default: 'events',description: 'URL slug for the events archive.' },
          ],
        },
      ],
    },
  ],

  restCallbacks: [
    {
      namespace:    'events-manager/v1',
      route:        '/events',
      className:    'Events_Controller',
      methods:      ['GET', 'POST'],
      capability:   'read',
      authRequired: false,
    },
    {
      namespace:    'events-manager/v1',
      route:        '/events/(?P<id>\\d+)',
      className:    'Event_Controller',
      methods:      ['GET', 'PUT', 'DELETE'],
      capability:   'edit_posts',
      authRequired: true,
    },
    {
      namespace:    'events-manager/v1',
      route:        '/venues',
      className:    'Venues_Controller',
      methods:      ['GET'],
      capability:   'read',
      authRequired: false,
    },
  ],

  postRestFields: [
    { fieldName: 'event_date',  postTypes: ['event'], type: 'string',  description: 'Event date (ISO format).', readonly: false },
    { fieldName: 'event_price', postTypes: ['event'], type: 'number',  description: 'Ticket price.',           readonly: false },
    { fieldName: 'venue_name',  postTypes: ['venue'], type: 'string',  description: 'Venue name alias.',       readonly: true },
  ],

  quickEdits: [
    {
      postType: 'event',
      fields: [
        { key: '_event_date',  label: 'Event Date',   type: 'date' },
        { key: '_event_price', label: 'Ticket Price', type: 'number' },
      ],
    },
  ],

  bulkEdits: [
    {
      postType: 'event',
      actions: [
        { slug: 'mark_featured',  label: 'Mark as Featured' },
        { slug: 'clear_featured', label: 'Remove Featured' },
      ],
    },
  ],

  blocks: [
    {
      name:              'event-card',
      title:             'Event Card',
      category:          'common',
      icon:              'dashicons-calendar-alt',
      description:       'Displays a single event card.',
      keywords:          'event, calendar, card',
      dynamic:           true,
      supportsAnchor:    false,
      supportsAlign:     true,
      supportsColor:     true,
      supportsTypo:      false,
      supportsSpacing:   true,
      supportsClassName: true,
      attributes: [
        { name: 'eventId',   type: 'number',  default: '0' },
        { name: 'showDate',  type: 'boolean', default: 'true' },
        { name: 'showPrice', type: 'boolean', default: 'true' },
      ],
    },
    {
      name:              'events-list',
      title:             'Events List',
      category:          'common',
      icon:              'dashicons-list-view',
      description:       'Displays a filterable list of events.',
      keywords:          'events, list, calendar',
      dynamic:           true,
      supportsAnchor:    false,
      supportsAlign:     true,
      supportsColor:     false,
      supportsTypo:      false,
      supportsSpacing:   true,
      supportsClassName: true,
      attributes: [
        { name: 'postsPerPage', type: 'number',  default: '6' },
        { name: 'category',     type: 'string',  default: '' },
        { name: 'showFilters',  type: 'boolean', default: 'true' },
      ],
    },
  ],

  emails: [
    { method: 'send_booking_confirmation', subject: 'Booking Confirmed: {event_name}', template: 'booking-confirmation.php', recipientType: 'user',  html: true, attachments: false },
    { method: 'send_admin_notification',   subject: 'New Booking Received',            template: 'admin-notification.php',  recipientType: 'admin', html: true, attachments: false },
  ],

  screenOptions: [
    { screen: 'edit-event', option: 'em_events_per_page', label: 'Events per page', default: 20, type: 'per_page' },
  ],

  userFields: [
    { key: 'em_attended_events', label: 'Attended Events',    type: 'text',     section: 'Events', description: 'Comma-separated event IDs the user attended.' },
    { key: 'em_organiser',       label: 'Is Event Organiser', type: 'checkbox', section: 'Events', description: 'Can this user create events?' },
  ],

  termFieldGroups: [
    {
      taxonomy: 'event_category',
      fields: [
        { key: '_cat_color', label: 'Category Color', type: 'color', description: 'Colour for calendar display.' },
        { key: '_cat_icon',  label: 'Category Icon',  type: 'text',  description: 'Dashicon class name.' },
      ],
    },
  ],

  mainMenu: {
    menuTitle:  'Events Manager',
    pageTitle:  'Events Manager',
    capability: 'manage_options',
    pageSlug:   'events-manager',
  },

  assets:    { css: [], js: [] },
  options:   [],
  tables:    [],
  restapi:   [],
  importers: [],
};

export default exampleSolution;
