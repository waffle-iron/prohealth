import TabularTables from './index.js';
import Tabular from 'meteor/aldeed:tabular';

Audits = new Mongo.Collection('audits');
TabularTables.Audits = new Tabular.Table({
    name: "Audits",
    collection: Audits,
    columns: [{
        data: "user",
        title: "UID"
    }, {
        data: "date",
        title: "Date"
    }, {
        data: "type",
        title: "Type"
    }, {
        data: "description",
        title: "Description"
    }, {
        data: "entityTable",
        title: "Table"
    }, {
        data: "entityId",
        title: "Entity ID"
    }]
});

auditsSchema = new SimpleSchema({
    user: {
      type: String,
      optional: false,
      label: 'profile.name'
    },
    // orion.attribute('hasOne', {
    //     label: 'User',
    //     optional: false
    // }, {
    //     collection: Meteor.users,
    //     titleField: 'profile.name',
    //     additionalFields: [], // we must add the active field because we use it in the filter
    //     publicationName: 'user_id',
    // }),
    date: {
        type: Date,
        optional: false,
        autoform: {
            type: "pickadate"
        }
    },
    type: {
        type: String,
        optional: false
    },
    description: {
        type: [String],
        optional: false
    },
    entityTable: {
        type: String,
        optional: false
    },
    entityId: {
        type: String,
        optional: false
    }
});
Audits.attachSchema(auditsSchema);

if(Meteor.isServer){
  Meteor.publish("audits", function(entityId){
    return  Audits.find({entityId: entityId});
  });
  Meteor.publish("bill-audits", function(){
    return  Audits.find({entityTable: "Bills",type:"delete"});
  });
  Audits.before.insert(function(userId, doc, fieldNames, modifier) {
    doc.date = new Date();
  });

}
export default Audits;
