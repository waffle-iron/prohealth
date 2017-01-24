import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';

Agencies = new Mongo.Collection('agencies');
TabularTables.Agencies = new Tabular.Table({
  name: "Agencies",
  collection: Agencies,
        columns: [
            { data: "name", title: "Name" },
            { data: "code", title: "Code" }
        ]

});


Agencies.attachSchema(new SimpleSchema({
    name: {
        type: String,
    },
    code: {
        type: String
    },
    rid: {
        type: Number,
        optional: true
    },
    sid: {
        type: Number,
        optional: true
    }
}));

if(Meteor.isServer){

    Meteor.publish("agencies", function(){
      return Agencies.find({},{sort:{name:1}});
    });
}
if (Meteor.isClient) {

}


export default Agencies;
