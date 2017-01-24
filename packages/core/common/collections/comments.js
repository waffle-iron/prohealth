import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';

Comments = new Mongo.Collection('Comments');
TabularTables.Comments = new Tabular.Table({
  name: "Comments",
  collection: Comments,
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
      data: "content",
      title: "Content"
  }, {
      data: "collection",
      title: "Collection"
  },
]
});
commentsSchema = new SimpleSchema({
    entityId: {
      type: String,
      optional:false
    },
    user: {
      type: String,
      optional: false,
    },
    date: {
        type: Date,
        optional: false,
        defaultValue: new Date(),
        autoform: {
            type: "pickadate"
        }
    },
    content: {
        type: String,
        optional: false,
        autoform:{
          label:"Leave a comment.."
        }
    },
    collection:{
      type: String,
      optional: false
    }
});
Comments.attachSchema(commentsSchema);

if(Meteor.isServer){

  Meteor.publish("comments", function(collection, entityId){
    return Comments.find({
      "entityId": entityId,
      "collection": collection
    });
  });
  Comments.after.insert(function(userId, doc, fieldNames, modifier) {
    let description = [];
    description.push(doc.content);
    Audits.insert({
      "user": userId,
      "date": doc.date,
      "type": "create",
      "description": description,
      "entityTable": "Comments",
      "entityId": doc.entityId
    });
  });
  // Comments.after.remove(function (userId, doc) {
  //
  // });
}
