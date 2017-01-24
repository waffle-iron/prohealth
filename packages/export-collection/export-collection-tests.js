// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by export-collection.js.
import { name as packageName } from "meteor/prohealth:export-collection";

// Write your tests here!
// Here is an example.
Tinytest.add('export-collection - example', function (test) {
  test.equal(packageName, "export-collection");
});
