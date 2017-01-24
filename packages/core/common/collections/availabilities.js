import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';

Availabilities = new Mongo.Collection('availabilities');
TabularTables.Availabilities = new Tabular.Table({
  name: "Availabilities",
  collection: Availabilities,
        columns: [
            { data: "name", title: "Name" }
        ]
});

Availabilities.attachSchema(new SimpleSchema({
    name: {
        type: String
    },
    rid: {

        type: Number,
        optional: true
    }
}));

if (Meteor.isServer) {
  Meteor.publish("availabilities", function(){
    return Availabilities.find({});
  });

}
if (Meteor.isClient) {

}

export default Availabilities;
