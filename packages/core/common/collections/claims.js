import TabularTables from './index.js';
import Tabular from 'meteor/aldeed:tabular';

Claims = new Mongo.Collection('claims');
TabularTables.Claims = new Tabular.Table({
    name: "Claims",
    collection: Claims,
    columns: [
      {data: "name"}
    ]
});

Claims.attachSchema(new SimpleSchema({
    name: {
        type: String
    },
}));

if(Meteor.isServer){
    Meteor.publish("claims", function(){
      return Claims.find({});
    });

    if (Claims.find().count() < 1) {
        Claims.insert({name: "HOSPICE" });
        Claims.insert({name: "RAP" });
        Claims.insert({name: "FINAL" });
        Claims.insert({name: "LUPA" });
        Claims.insert({name: "HOSPICE R&B" });
        Claims.insert({name: "ADR" });
    }
}

export default Claims;
