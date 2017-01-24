Package.describe({
  name: 'prohealth:hr-agents',
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
  api.use('jquery');
  api.use("underscore");

  api.use('tomi:upload-server');
  api.use('tomi:upload-jquery', ['client']);
  api.use('pdftk:pdftk');
  api.use('pascoual:pdfjs');
  api.use('ostrio:meteor-root');
  api.use('iain:accounting@0.4.2');
  api.use('alethes:pages@1.8.6');
  api.use('aldeed:autoform');
  api.use('aldeed:tabular');
  // api.use('nicolaslopezj:tabular-materialize');
  api.use('prohealth:core');
  api.use('lepozepo:s3');
  api.use('juliancwirko:s-alert');
  api.use('juliancwirko:s-alert-scale');

  api.addFiles(['client/index.js'], ['client']);
  api.addFiles(['server/index.js'], ['server']);
  api.addFiles(['common/index.js'], ['server', 'client']);
  api.mainModule('hr-agents.js');
});
