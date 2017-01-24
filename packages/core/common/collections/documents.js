import Agents from './agents'
import DocumentTypes from './document_types'
import Jobs from './jobs'
import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';

Documents = new Mongo.Collection('documents');

TabularTables.Documents = new Tabular.Table({
    name: "Documents",
    collection: Documents,
    columns: [{
            data: "_id",
            title: "ID"
        },
        {
            data: "name",
            title: "Name"
        },
    ]
});

Documents.attachSchema(new SimpleSchema({
    name: {
        type: String
    },
    url: {
        type: String
    },
    expires: {
        type: Date,
        optional: true,
        autoform: {
            type: "pickadate"
        }
    },
    rotation: {
        type: Number,
        optional: true,
        defaultValue: 0
    },
    page: {
        type: Number,
        optional: true
    },
    document_type_id: {
        type: String,
        optional: true,
        autoform: {
            type: "select",
            options: function() {
                var a = DocumentTypes.find().fetch();
                var r = [];
                a.forEach(function(e) {
                    r.push({
                        label: e.name,
                        value: e._id
                    });
                });
                return r;
            }
        }
    },
    // orion.attribute('hasOne', {
    //     label: 'Document Type',
    //     optional: true
    // }, {
    //     collection: DocumentTypes,
    //     titleField: 'name',
    //     additionalFields: [], // we must add the active field because we use it in the filter
    //     publicationName: 'document_document_type_pub',
    // }),
    document_type_name: {
        type: String,
        optional: true,
        autoValue: function() {
            var docType = DocumentTypes.findOne(this.field("document_type_id").value);
            if (docType)
                return docType.name;
        }
    },
    agent: {
        type: String,
        optional: true,
        autoform: {
            type: "select",
            options: function() {
                var a = Agents.find().fetch();
                var r = [];
                a.forEach(function(e) {
                    r.push({
                        label: e.name,
                        value: e._id
                    });
                });
                return r;
            }
        }
    }
    // orion.attribute('hasOne', {
    //     label: 'Agent'
    // }, {
    //     collection: Agents,
    //     titleField: 'name',
    //     additionalFields: [], // we must add the active field because we use it in the filter
    //     publicationName: 'document_agent',
    // })
}));


Documents.helpers({
    document_type() {
        if (this.document_type_id) {
            let document_type = DocumentTypes.findOne(this.document_type_id);
            return document_type;
        }
    },
    agent() {
        if (this.agent) {
            let agent = Agents.findOne(this.agent);
            return agent;
        }
    },

    title() {
        // console.log("getting document title")
        // console.log(this.document_type_id);
        if (this.document_type_id) {
            return this.document_type().name;
        }
        return this.name;
    }
});


if (Meteor.isServer) {
    Documents.before.update(function(userId, doc, fieldNames, modifier, options) {
        // Logger.info("field_names", fieldNames);
        if (_.contains(fieldNames, "document_type_id")) {
            let new_document_type = modifier.$set.document_type_id;
            let agent = Agents.findOne(doc.agent);
            if (agent) {
                // Logger.info("Agent", agent);
                let missing_documents = agent.missing_documents_ids || [];
                // Logger.info("Missing Documents", missing_documents);

                if (doc.document_type) {
                    let old_document_type = doc.document_type_id;

                    // Logger.info("Old Document Type", old_document_type);
                    let job = Jobs.findOne(agent.job_id);
                    // Logger.info("Corresponding Job", job);

                    if (_.contains(job.document_types, old_document_type)) {
                        missing_documents.push(old_document_type);
                    }
                }

                if (_.contains(missing_documents, new_document_type)) {
                    missing_documents = _.without(missing_documents, new_document_type);
                }
                missing_documents[new_document_type] = true;
                // Logger.info("Missing Documents", missing_documents);

                Agents.update({
                    "_id": agent._id
                }, {
                    $set: {
                        missing_documents_ids: missing_documents
                    }
                });
            }
            var expiryOfNewType = Documents.findOne({
                agent: doc.agent,
                document_type_id: modifier.$set.document_type_id,
                expires: {
                    $exists: true
                }
            })
            if (expiryOfNewType) {
                modifier["$set"].expires = expiryOfNewType.expires;
            } else {
                if (modifier["$unset"]) {
                    modifier["$unset"].expires = "";
                } else {
                    modifier["$unset"] = {
                        expires: ""
                    };
                }
            }
        }
    });

    Documents.after.remove(function(userId, doc) {
        var docsOfPreviousType = Documents.find({
            $and: [{
                document_type_id: doc.document_type_id
            }, {
                page: {
                    $gt: doc.page
                }
            }]
        });

        if (docsOfPreviousType.fetch().length > 0) {
            _.each(docsOfPreviousType.fetch(), function(document) {
                Documents.update({
                    _id: document._id
                }, {
                    $set: {
                        page: document.page - 1
                    }
                })
            })
        }
    });
    Meteor.publish("agentDocumentsType", function(agent_id, document_type_id) {
        let document_type = {
            $exists: false
        };
        console.log("document_Type_id: ", document_type_id)
        if (document_type_id != "nodoctype") {
            document_type = document_type_id;
        }
        return Documents.find({
            agent: agent_id,
            document_type_id: document_type
        });
    });
    Meteor.publish("agentDocuments", function(agent_id) {
        return Documents.find({
            agent: agent_id
        });
    });
    Meteor.publish("agentDocumentsFields", function(agent_id) {
        return Documents.find({
            agent: agent_id
        }, {
            fields: {
                "_id": 1,
                "document_type_id": 1,
                "agent": 1,
                "page": 1,
                expires: 1
            }
        });
    });
    Meteor.publish("document", function(id) {
        return Documents.find({
            _id: id
        });
    });

    Meteor.publish("expiringDocs", function(query) {
        ReactiveAggregate(this, Documents, [{
            $match: query
        }, {
            $group: {
                _id: "$agent",
                docs: {
                    $push: "$$ROOT"
                }
            }
        }], {
            clientCollection: "expiring-docs"
        });
    });


}


Meteor.methods({
    deleteDocument(id) {
        Documents.remove(id);
    }
})
export default Documents;
