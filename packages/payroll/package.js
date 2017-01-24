Package.describe({
  name: 'prohealth:payroll',
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
  api.versionsFrom('1.4.1.1');
  api.use('ecmascript');

  api.use('templating');
  api.use('session');
  api.use('http');

  api.use('prohealth:core');


  api.use('session');
  api.use('iron:router');
  api.use('reactive-dict');
  api.use('momentjs:moment');
  api.use('aldeed:collection2');
  api.use("aldeed:autoform");
  api.use("aldeed:tabular");
  api.use('meteorhacks:aggregate');
  api.use('richsilv:pikaday@1.0.1');
  api.use('jcbernack:reactive-aggregate@0.6.0');
  api.use('meteorhacks:subs-manager');

 api.addFiles(['client/index.js'], ['client']);
 // api.addFiles(['common/index.js'], ['common']);
 api.addFiles(['server/index.js'], ['server']);

  api.mainModule('payroll.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('prohealth:payroll');
  api.mainModule('payroll-tests.js');
});
