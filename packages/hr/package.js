Package.describe({
  name: 'prohealth:hr',
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

  api.use('prohealth:hr-agents');
  api.use('prohealth:hr-documents');
  api.mainModule('hr.js');
});
