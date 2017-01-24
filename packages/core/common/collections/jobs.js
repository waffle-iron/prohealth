import DocumentTypes from './document_types'
import TabularTables from './index';
import ActivityTypes from './activity_types'
import Tabular from 'meteor/aldeed:tabular';

Jobs = new Mongo.Collection('jobs');

JobsSchema = new SimpleSchema({
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
  },

  document_types_ids: {
    type: Array,
    label: "Document Types",
    optional: true,
    autoform: {
      type: "select-checkbox",
      options: function(){
        var a = DocumentTypes.find().fetch();
        var r = [];
        a.forEach(function(e){
          r.push( { label: e.name, value: e._id } );
        });
        return r;
      }
    }
  },

  "document_types_ids.$": {
    type: String,
    optional: true,

  },

  activity_types_ids: {
    type: Array,
    label: "Activity Types",
    optional: true,
    autoform: {
      type: "select-checkbox",
      options: function(){
        var a = ActivityTypes.find().fetch();
        var r = [];
        a.forEach(function(e){
          r.push( { label: e.name, value: e._id } );
        });
        return r;
      }
    }
  },

  "activity_types_ids.$": {
    type: String,
    optional: true
  }
});

Jobs.attachSchema(JobsSchema);

Jobs.helpers({
  document_types(){
    if(this.document_types_ids && ((typeof this.document_types_ids) === "function")) {
      return DocumentTypes.find({ "_id": { $in: this.document_types_ids().array() } });
    }
  }
});

TabularTables.Jobs = new Tabular.Table({
  name: "Jobs",
  collection: Jobs,
  columns: [
      { data: "name", title: "Name" },
      { data: "description", title: "Description" }
  ]
});

if(Meteor.isServer){
  Meteor.publish("jobs", function(){
    return Jobs.find({}, { sort: {name: 1} });
  });

  Jobs.after.update(function(userId, doc, fieldNames, modifier){
    var agents = Agents.find({job_id: doc._id}).fetch();
    _.each(agents, function(agent){
      var missingDocs = doc.document_types_ids;
      docs = agent.documents().fetch();
      if(missingDocs){
        if(docs.length>0){
          _.each(docs,function(document){
            if(document.document_type_id){
              if(missingDocs.indexOf(document.document_type_id)>-1){
                missingDocs.splice(missingDocs.indexOf(document.document_type_id),1);
              }
            }
          });
        }
        Agents.update({_id: agent._id},{$set: {missing_documents_ids: missingDocs}});
      }
      else {
      Agents.update({_id: agent._id},{$unset: {missing_documents_ids: []}})
      }
    });
  });
}

export default Jobs;
