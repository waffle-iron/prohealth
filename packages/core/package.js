Package.describe({
  name: 'prohealth:core',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.4.1');
  api.use('ecmascript');
  api.use('templating');
  api.use('session');
  api.use("insecure");

  api.use("digilord:faker");
  api.use("momentjs:moment");
  api.use("iain:accounting");
  api.use("aldeed:collection2");
  api.use("aldeed:autoform");
  api.use('aldeed:tabular');
  api.use("meteorhacks:aggregate");
  api.use("matb33:collection-hooks");

  api.use("aldeed:delete-button");
  api.use("richsilv:pikaday");
  api.use('meteorhacks:subs-manager');

  api.addFiles(['client/index.js'], ['client']);
  api.addFiles(['common/index.js'], ['server', 'client']);



  api.addAssets("private/fixtures/activity_types.json", "server");
  api.addAssets("private/fixtures/agencies.json", "server");
  api.addAssets("private/fixtures/agents_rates.json", "server");
  api.addAssets("private/fixtures/agents.json", "server");
  api.addAssets("private/fixtures/areas.json", "server");
  api.addAssets("private/fixtures/availabilities.json", "server");
  api.addAssets("private/fixtures/document_types.json", "server");
  api.addAssets("private/fixtures/jobs_activity_types.json", "server");
  api.addAssets("private/fixtures/jobs.json", "server");
  api.addAssets("private/fixtures/users_agencies.json", "server");
  api.addAssets("private/fixtures/payments.json", "server");
  api.addAssets("private/fixtures/bills.json", "server");
  api.addAssets("private/fixtures/users_areas.json", "server");
  api.addAssets("private/fixtures/users_availabilities.json", "server");

  api.addFiles(['server/fixtures.js'], ['server']);

  api.export('Agencies');
  api.export('Agents');
  api.export('Areas');
  api.export('Availabilities');
  api.export('CompensationTypes');
  api.export('CompensationRates');
  api.export('DocumentTypes');
  api.export('Documents');
  api.export('Jobs');


  api.export('Bills');
  api.export('FollowUps');
  api.export('Audits');
  api.export('Comments');
  api.export('Claims');
  api.export('Patients');
  api.export('PatientsSettings');
  api.export('PaymentTypes');
  api.export('Payments');
  api.export('Payors');
  api.export('Visits');
  api.export('VisitsSettings');
  api.export('Utils');
  api.export('VisitsAggregates');
  api.mainModule('core.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('prohealth:core');
  api.mainModule('core-tests.js');
});
