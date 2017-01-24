import TabularTables from './index.js';
import Tabular from 'meteor/aldeed:tabular';

FollowUps = new Mongo.Collection('follow_ups');
TabularTables.FollowUps = new Tabular.Table({
  name: "FollowUps",
  collection: FollowUps,
  columns: [{
      data: "entityId",
      title: "Entity"
  },{
      data: "user.name",
      title: "UID"
  }, {
      data: "date",
      title: "Date"
  }, {
      data: "note",
      title: "Note"
  }, {
      data: "collection",
      title: "Collection"
  },
]
});

followUpsSchema = new SimpleSchema({
    entityId: {
      type: String,
      optional:false
    },
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
    //     publicationName: 'followup_user_id',
    // }),
    date: {
        type: Date,
        optional: false,
        defaultValue: new Date(),
        autoform: {
            type: "pickadate"
        }
    },
    createdAt: {
      type: Date,
      defaultValue: new Date()
    },
    done: {
        type: Boolean,
        optional: false,
        defaultValue: false,
    },
    note: {
        type: String,
        optional: false
    },
    collection:{
      type: String,
      optional: false
    }
});
FollowUps.attachSchema(followUpsSchema);

if(Meteor.isServer){
  Meteor.publish("followups", function(collection, entityId){
    return FollowUps.find({
      "entityId": entityId,
      "collection": collection
    },{sort: {createdAt:-1}});
  });
  Meteor.publish("billFollowups", function(collection){
    return FollowUps.find({
      "collection": collection
    });
  });
  FollowUps.before.insert(function(userId, doc, fieldNames, modifier) {
    // let description = [];
    // description.push(doc.content);
    // Audits.insert({
    //   "user": userId,
    //   "date": doc.date,
    //   "type": "create",
    //   "description": description,
    //   "entityTable": "FollowUps",
    //   "entityId": doc.entityId
    // });
    doc.createdAt = Date.now();
    var followUps = FollowUps.find({$or : [{"entityId": doc.entityId,"date":{$lt: doc.date}},{"entityId": doc.entityId,"date":doc.date}]}).fetch();
    _.each(followUps, function(followUp){
      if(followUp._id != doc._id)
        FollowUps.update({"_id": followUp._id}, {$set:{done:true}});
    })
  });

}
