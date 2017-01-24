import Tabular from 'meteor/aldeed:tabular';
import Utils from '../utils.js';
import Agencies from './agencies';
import Areas from './areas';
import Availabilities from './availabilities';
import DocumentTypes from './document_types';
import Jobs from './jobs';
import TabularTables from './index';

Agents = new Mongo.Collection('agents');

TabularTables.Agents = new Tabular.Table({
  name: "Agents",
  collection: Agents,
  columns: [
      { data: "agencies", title: "agencies", visible: false },
      { data: "areas", title: "areas", visible: false },
      { data: "availabilities", title: "availabilities", visible: false },
      { data: "_id", title: "ID" },
      { data: "name", title: "Name" },
      { data: "agencies", title: "Agencies" },

  ]
});

AgentsSchema = new SimpleSchema({
    name: {
        type: String
    },
    // picture: orion.attribute('image', {
    //     label: 'Foto',
    //     optional: true,
    // }),
    job_id: {
      type: String,
      optional: true,
      autoform: {
        type: "select",
        options: function(){
          let jobs = Jobs.find().fetch();
          var jobsArray = [];
          jobs.forEach(function(job){
            jobsArray.push( { label: job.name, value: job._id } );
          });
          return jobsArray;
        }
      }
    },
    // orion.attribute('hasOne', {
    //     label: 'Job',
    //     optional: true
    // }, {
    //     collection: Jobs,
    //     titleField: 'name',
    //     additionalFields: [], // we must add the active field because we use it in the filter
    //     publicationName: 'agent_job',
    // }),

    agencies: Utils.hasManyFrom(Agencies, "name"),
    // {
    //   type: [String],
    //   optional: true,
    //   autoform: {
    //     type: "select-checkbox",
    //     options: function() {
    //       let j = Agencies.find().fetch();
    //       let k = [];
    //       j.forEach(function(e) {
    //         k.push( { label: e.name, value: e._id } );
    //       });
    //       return k;
    //     }
    //   }
    // },
    areas: Utils.hasManyFrom(Areas, "name"),
    availabilities: Utils.hasManyFrom(Availabilities, "name"),
    missing_documents_ids: {
        type: [String],
        optional: true
    },
    expiration_dates: {
        type: [Date],
        optional: true,
        autoform: {
            omit: true
        }
    },
    email: {
        type: String,
        optional: true,
        label: 'E-mail',
        regEx: SimpleSchema.RegEx.Email
    },

    phone: {
        type: String,
        optional: true,
    },

    mobile: {
        type: String,
        optional: true,
    },
    rid: {
        type: Number,
        optional: true
    },
    active: {
        type: Boolean,
        optional: true
    },
    supervisor: {
      type: String,
      optional: true,
      autoform: {
        type: "select",
        options: function(){
          var a = Agents.find().fetch();
          var r = [];
          a.forEach(function(e) {
            r.push( { label: e.name, value: e._id } );
          });
          return r;
        }
      }
    }


});

Agents.attachSchema(AgentsSchema);

Agents.helpers({
    job_name: function() {
        if (this.job_id){
          return Jobs.findOne(this.job_id).name;
        }
    },
    agencies: function() {
        // console.log(typeof this.agencies_ids);
        if (this.agencies_ids) {
            return Agencies.find({ _id: { $in: this.agencies_ids || [] } }).fetch();
        }
    },
    areas: function() {
        if (this.areas_ids ) {
            return Areas.find({ _id: { $in: this.areas_ids || [] } }).fetch();
        }
    },
    availabilities: function() {
        if (this.availabilities_ids ) {
            return Availabilities.find({ _id: { $in: this.availabilities_ids || [] } }).fetch();
        }
    },
    agenciesNames: function() {
        return _.map(this.agencies(), function(agency) {
            return agency.name
        }).join(", ");
    },
    areasNames: function() {
        return _.map(this.areas(), function(area) {
            return area.name
        }).join(", ");
    },
    availabilitiesNames: function() {
        return _.map(this.availabilities(), function(availability) {
            return availability.name
        }).join(", ");
    },
    documents() {
        let q = { agent: this._id };
        // console.log(q);

        // console.log(Documents.find(q).fetch());
        return Documents.find({ agent: this._id });
    },
    missing_documents() {

        if (this.missing_documents_ids)
            return DocumentTypes.find({ "_id": { $in: this.missing_documents_ids().array() } });
    },
    rates() {
        return CompensationRates.find({ agent: this._id() });
    },
    job() {
        if (this.job_id) {
            return Jobs.findOne(this.job_id);
        }
    }
});




if (Meteor.isServer) {
    Agents.after.insert(function (userId, doc) {
        if (doc.job_id) {
            // Logger.info("Agent", doc);
            let job = Jobs.findOne(doc.job_id);
            if (job) {
                // Logger.info("Job", job);
                let missing_documents = [];
                let required_documents = job.document_types_ids;
                // Logger.info("Required Documents", required_documents);

                _.each(required_documents, function(required_document) {
                    missing_documents.push(required_document);
                })

                let available_documents = Documents.find({ agent: doc._id }).fetch();
                // Logger.info("Available Documents", available_documents);
                // Logger.info("Agent ID", doc._id);
                let agent_id = doc._id;
                _.each(available_documents, function(available_document) {
                  if(missing_documents.length >0){
                    if (available_document.document_type()) {
                        // Logger.info(available_document.document_type);
                        missing_documents = _.without(missing_documents, available_document.document_type()._id);
                        // console.log(available_document.document_type()._id);
                    }
                  }
                });
                Agents.update({_id:doc._id},{$set:{missing_documents_ids: missing_documents}})
            }
        }
    });
    Agents.before.update(function(userId, doc, fieldNames, modifier, options) {
        // Logger.info("field_names", fieldNames);
        // Logger.info("Modifier: ", modifier.$set);
        // Logger.info("Agent start", doc);
        if (_.contains(fieldNames, "job_id")) {
            // Logger.info("Agent", doc);
            let job = Jobs.findOne(modifier.$set.job_id);
            if (job) {
                // Logger.info("Job", job);
                let missing_documents = [];
                let required_documents = job.document_types_ids;
                // Logger.info("Required Documents", required_documents);

                _.each(required_documents, function(required_document) {
                    missing_documents.push(required_document);
                })

                let available_documents = Documents.find({ agent: doc._id }).fetch();
                // Logger.info("Available Documents", available_documents);
                // Logger.info("Agent ID", doc._id);
                let agent_id = doc._id;
                _.each(available_documents, function(available_document) {
                  if(missing_documents.length >0){
                    if (available_document.document_type()) {
                        // Logger.info(available_document.document_type);
                        missing_documents = _.without(missing_documents, available_document.document_type()._id);
                        // console.log(available_document.document_type()._id);
                    }
                  }
                });
                // Logger.info("Missing Documents", missing_documents);
                modifier.$set.missing_documents_ids = missing_documents;
                // Logger.info("Agent end", Agents.findOne(agent_id));
            }
        }
    });
}
export default Agents;

if (Meteor.isServer) {
  Meteor.publish("agent", function(id){
    return Agents.find({_id:id});
  });
  Meteor.publish("agentByName", function(name){
    return Agents.find({name:name});
  });
  Meteor.publish("agents", function(query){
    return Agents.find(query,{sort:{name:1}});
  });
  Meteor.publish("agentNames", function(){
    return Agents.find({},{name: 1},{sort:{name:1}});
  });
  Meteor.methods({
    exportAllAgents: function(selector, fields) {
        // console.log(selector);
        var data = [];
        var collectionItems = Agents.find(selector).fetch();
        // console.log(collectionItems);
        var arr = fields.split(",");
        _.each(collectionItems, function(item) {
            var row = [];
            for (i = 0; i < arr.length; i++) {
              if(arr[i]=="job"){
                if(item.job_id){
                  var job = Jobs.findOne(item.job_id);
                  if(job)
                    row.push(job.name);
                  else{
                    row.push("");
                  }
                }else{
                  row.push("");
                }
              }
              else
                row.push(item[arr[i]]);
            }
            data.push(row);
        });
        return { fields: fields.split(","), data: data };
    }
  });
}
