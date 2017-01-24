// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by hr-agents.js.
import { name as packageName } from "meteor/prohealth:hr-agents";

// Write your tests here!
// Here is an example.
Tinytest.add('hr-agents - example', function (test) {
  test.equal(packageName, "hr-agents");
});
