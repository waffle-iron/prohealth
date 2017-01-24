// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by hr-documents.js.
import { name as packageName } from "meteor/billing";

// Write your tests here!
// Here is an example.
Tinytest.add('billing - example', function (test) {
  test.equal(packageName, "billing");
});
