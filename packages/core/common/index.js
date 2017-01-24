import "./collections/index.js";
import "./utils.js";

var schema = new SimpleSchema({
roles: {
    type: [String],
    optional: true,
}
});

Meteor.users.attachSchema(schema);
