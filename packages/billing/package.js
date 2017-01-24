Package.describe({
  name: 'prohealth:billing',
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

  api.use("prohealth:core");

  api.use('momentjs:moment');
  api.use('mizzao:autocomplete');
  api.use('gildaspk:autoform-materialize');
  api.use('aldeed:autoform');
  api.use('aldeed:tabular');
  api.use('aldeed:collection2');
  api.use('meteorhacks:aggregate');
  api.use('jcbernack:reactive-aggregate');
  api.use('pascoual:pdfjs')

  api.addFiles(['client/index.js'], ['client']);
  api.addFiles(['common/index.js'], ['client', 'server']);
  api.addFiles(['server/index.js'], ['server']);
  api.mainModule('billing.js');
});
