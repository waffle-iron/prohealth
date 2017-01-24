var hooks = ({
    before: {
        update: function(doc) {
            if (doc.$set.document_type_id != Router.current().params.document_type_id) {
                var docsOfPreviousType = Documents.find({
                    $and: [{
                        document_type_id: Router.current().params.document_type_id
                    }, {
                        page: {
                            $gt: doc.$set.page
                        }
                    }, {agent : Router.current().params.agent_id}]
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

                var maxPage = Documents.findOne({
                  agent: Router.current().params.agent_id,
                  document_type_id: doc.$set.document_type_id
                }, {
                    sort: {
                        page: -1
                    },
                    limit: 1
                })
                if (maxPage) {
                    var p = maxPage.page + 1;
                    doc.$set.page = p;
                } else {
                    doc.$set.page = 0;
                }
            }
            return doc;
        }
    }
});

Template.documentEdit.events({
    'click .delete': function() {
        // this.remove();
        Documents.remove(Router.current().params._id);
    },
});

Template.documentEdit.viewmodel({
  headerVariable: function(){
    var agent = Agents.findOne({
        "_id": Router.current().params.agent_id
    });
    var title = "";
    var subtitle = "";
    if(agent){
      title = agent.name;
      subtitle = "Editing "+agent.name+"'s profile documents"
    }
    return {title:title,subtitle:subtitle,hasBack:true};

  },
    dataurl: function(url){
      return "data:image/png;base64," + url;
    },
    docType: function(){
      return Router.current().params.type_id;
    },
    onCreated: function() {
      this.templateInstance.subscribe("agentDocuments", Router.current().params.agent_id);
        this.templateInstance.subscribe("document_types");
    },
    autorun: function(){
      this.templateInstance.subscribe("agent",Router.current().params.agent_id)
    },
    firstDoc: function(list, elem) {
        // console.log(_.first(list.fetch()));
        // console.log(elem);
        if (Router.current().params.document_type_id)
            return _.first(list.fetch())._id === elem._id;
    },
    document: function() {
        return Documents.findOne({
            "_id": Router.current().params._id
        });
    },
    hasDocType: function() {
        if (Documents.findOne({
                "_id": Router.current().params._id
            }).document_type_id) {
            return true;
        }
        return false;
    },
    agent: function() {
        return Agents.findOne({
            "_id": Router.current().params.agent_id
        });
    },
    documents: function() {
        var agent = Router.current().params.agent_id;
        if (Router.current().params.document_type_id) {
            var document_type_id = Router.current().params.document_type_id;
            return Documents.find({
                agent: agent,
                document_type_id: document_type_id
            }, {
                sort: {
                    page: 1
                }
            });
        } else {
            return Documents.find({
                agent: agent,
                document_type_id: {
                    $exists: false
                }
            }, {
                sort: {
                    name: 1
                }
            });
        }
    },
    render: function(doc) {
        var url = doc.url;
        var renderPDF = function() {
            // Prepare canvas using PDF page dimensions
            var canvas = document.getElementById('pdfcanvas' + doc._id);
            var context = canvas.getContext('2d');
            canvas.height = 785;
            canvas.width = 595;
            var image = new Image();

            image.src = "data:image/png;base64," + url;
            image.onload = function() {
                // context.drawImage(imageObj, 69, 50);
                context.drawImage(image, 0, 0,
                    canvas.width, canvas.height);
            };
        };
        Meteor.setTimeout(renderPDF, 1000);
    },
    addHooks: function(id) {
        AutoForm.addHooks(id, hooks);
    },
    categorized: function() {
        if (Router.current().params.document_type_id)
            return true;
        return false;
    },
    events: {
        "click #submit": function(e) {
            if ($("#expiresField").val()) {
                var agent = Router.current().params.agent_id;
                if (Router.current().params.document_type_id) {
                    var document_type_id = Router.current().params.document_type_id;
                    // Must update in server
                    Meteor.call("updateSimilarDocs", agent, document_type_id, $("#expiresField").val());
                }
            }
        }
    }
});
