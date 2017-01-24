import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';

DocumentTypes = new Mongo.Collection('document_types');
TabularTables.DocumentTypes = new Tabular.Table({
  name: "DocumentTypes",
  collection: DocumentTypes,
        columns: [
            { data: "name", title: "Name" }
        ]
});

DocumentTypes.attachSchema(new SimpleSchema({
    name: {
        type: String
    },
    description: {
        type: String,
        optional: true
    },
    rid: {
        type: Number,
        optional: true
    }
}));

if (Meteor.isServer) {
  Meteor.publish("document_types", function(){
    return DocumentTypes.find({},{sort:{name:1}});
  });
}
if (Meteor.isClient) {

}

export default DocumentTypes;
