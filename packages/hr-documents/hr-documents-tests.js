// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by hr-documents.js.
import { name as packageName } from "meteor/hr-documents";

// Write your tests here!
// Here is an example.
Tinytest.add('hr-documents - example', function (test) {
  test.equal(packageName, "hr-documents");
});
