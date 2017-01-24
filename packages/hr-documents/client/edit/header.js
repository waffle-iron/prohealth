Template.docsHeader.viewmodel({
    headerVariable: function() {
        var agent = Agents.findOne({
            "_id": Router.current().params.agent_id
        });
        var title = "";
        var subtitle = "";
        if (agent) {
            title = agent.name;
            var id = Router.current().params.type_id;
            if (id === "nodoctype")
                subtitle = "Editing uncategorized documents"
            else {
                var docType = DocumentTypes.findOne({
                    _id: id
                });
                if (docType)
                    subtitle = "Editing " + docType.name + " documents"
            }
        }
        return {
            title: title,
            subtitle: subtitle,
            hasBack: true
        };
    },
    docType: function() {
        return DocumentTypes.findOne({
            _id: Router.current().params.type_id
        });
    },
    documents: function(document_type_id) {
        var agent = Router.current().params.agent_id;
        // if (Router.current().params.document_type_id) {
        return Documents.find({
            agent: agent,
            document_type_id: document_type_id
        }, {
            sort: {
                page: 1
            }
        }).fetch();
    },
    expiry: function(document_type_id) {
        var doc = Documents.findOne({
            agent: Router.current().params.agent_id,
            document_type_id: document_type_id
        });
        if (doc) {
            if (doc.expires) {
                if (this.picker()) {
                    this.picker().setMoment(moment(doc.expires));
                };
                return moment(doc.expires).format("MM/DD/YYYY");
            } else {
                $("#expiresType").val("")
                return "";
            }
        }
    },
    hasExpiry: function(){
      if(this.docType()){
        console.log(this.documents(this.docType()._id));
        if(this.documents(this.docType()._id).length>0)
          return "initial"
        else {
          return "none";
        }
      } else {
        return "none";
      }
    },
    agent_id: function() {
        return Router.current().params.agent_id;
    },
    picker: "",
    onRendered() {
      console.log("here");
        if ($("#expiresType").hasClass("invalid"))
            $("#expiresType").toggleClass("invalid")

        var _this = this;
        setTimeout(function() {
            if (document.getElementById("expiresType")) {
                _this.picker(new Pikaday({
                    field: document.getElementById("expiresType"),
                    format: 'MM/DD/YYYY',
                }));
            }
        }, 500);
    },
    events: {
        "submit form" (event) {
            event.preventDefault();

            if (event.target.expires) {
              if(!$("#expiresType").hasClass("invalid")){
                var agent = Router.current().params.agent_id;
                if (agent) {
                    var docs = Documents.find({
                        "agent": agent,
                        "document_type_id": Router.current().params.type_id
                    }).fetch();

                    _.each(docs, function(doc) {
                        Documents.update({
                            "_id": doc._id
                        }, {
                            $set: {
                                "expires": event.target.expires.value
                            }
                        });

                    });
                }
            }
          }
        }
    }
});
