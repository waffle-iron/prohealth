import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';
CompensationTypes = new Mongo.Collection('compensation_types');

TabularTables.CompensationTypes = new Tabular.Table({
  name: "CompensationTypes",
  collection: CompensationTypes,
        columns: [
            { data: "name", title: "Name" },
            { data: "description", title: "Description" }
        ]
});

CompensationTypes.attachSchema(new SimpleSchema({
    name: {
        type: String
    },
    multi: {
        type: Boolean
    }
}));

export default CompensationTypes;

if (Meteor.isServer) {
  Meteor.publish("compensation_types", function(){
    return CompensationTypes.find({},{sort:{name:1}});
  });


}
if (Meteor.isClient) {

}
