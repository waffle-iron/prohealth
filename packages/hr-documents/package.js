Package.describe({
  name: 'prohealth:hr-documents',
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
  api.use("underscore");

  api.use('alethes:pages');
  api.use('prohealth:core');
  api.use('momentjs:moment');
  api.use('pascoual:pdfjs');
  api.use("check");
  api.use("rubaxa:sortable");
  api.use('richsilv:pikaday')

  api.use('aldeed:collection2');
  api.use('jcbernack:reactive-aggregate@0.6.0');



  api.addFiles(['client/index.js'], ['client']);
  api.addFiles(['common/index.js'], ['client', 'server']);
  api.addFiles(['server/index.js'], ['client', 'server']);
  api.mainModule('hr-documents.js');
});
