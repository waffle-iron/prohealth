import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';

Areas = new Mongo.Collection('areas');
TabularTables.Areas = new Tabular.Table({
  name: "Areas",
  collection: Areas,
        columns: [
            { data: "name", title: "Name" }
        ]
});

Areas.attachSchema(new SimpleSchema({
    name: {
        type: String
    },
    rid: {
        type: Number,
        optional: true
    }
}));

if (Meteor.isServer) {
  Meteor.publish("areas", function(){
    return Areas.find({},{sort:{name:1}});
  });
}
if (Meteor.isClient) {

}

export default Areas;
