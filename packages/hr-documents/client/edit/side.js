var date_regex = /((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d)|((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])(19|20)\d\d)/;
var validateDate = function(id, value) {
    if (!date_regex.test(value) && value) {
        if (!$("#" + id).hasClass("invalid"))
            $("#" + id).toggleClass("invalid");
    } else {
        if ($("#" + id).hasClass("invalid"))
            $("#" + id).toggleClass("invalid");
    }
};

Template.typebar.viewmodel({
    typeName: "",
    sortables: {},
    onCreated() {
        this.templateInstance.subscribe("agentDocumentsFields", Router.current().params.agent_id);
    },
    sideId: function(id) {
        return id + "Side";
    },
    newDocType: function() {
        if (Session.get("documentTypeExpiry")) {
            if (DocumentTypes.findOne({
                    _id: Session.get("documentTypeExpiry")
                }))
                return DocumentTypes.findOne({
                    _id: Session.get("documentTypeExpiry")
                }).name
        }
    },
    agent_id: function() {
        return Router.current().params.agent_id;
    },
    hasDocs: function(id) {
        var hasdocs = Documents.find({
            agent: Router.current().params.agent_id,
            document_type_id: id
        }).fetch();
        if (hasdocs.length > 0) {
            return "green darken-1"
        } else {
            return "blue lighten-2"
        }
    },
    isExpired: function(id) {
        var expDoc = Documents.findOne({
            agent: Router.current().params.agent_id,
            document_type_id: id,
            expires: {
                $lte: new Date()
            }
        });
        if (expDoc)
            return true;
        else
            return false;
    },
    documentsPerType: function(id) {
        var hasdocs = [];
        if (id === "nodoctype") {
            hasdocs = Documents.find({
                agent: Router.current().params.agent_id,
                document_type_id: {
                    $exists: false
                }
            }).fetch();
        } else {
            hasdocs = Documents.find({
                agent: Router.current().params.agent_id,
                document_type_id: id
            }).fetch();
        }
        return hasdocs.length;

    },
    onRendered: function() {
        // console.log();
        var _this = this;
        setTimeout(function() {
            $('.yaybar').each(function() {
                var options = $.extend({}, YAY.DEFAULTS, $(this).data(), typeof option == 'object' && option);
                var curyay = new YAY(this, options);
            });

            $("#" + Router.current().params.type_id).toggleClass("open");

            new Pikaday({
                field: document.getElementById("expiresModal"),
                format: 'MM/DD/YYYY'
            })
        }, 500);
    },
    initializeSortables() {
        console.log("here");
        if (this.templateInstance.subscriptionsReady()) {
            setTimeout(function() {
                var documentContainers = $(".doc-side");
                var sortables = {};
                var id = Router.current().params.type_id
                _.each(documentContainers, function(element) {
                    sortables[element.id] = createSortable(element);
                });
            }, 600);
        }
    },
    containerNameEmpty: function(id) {
        return id + "containerEmpty";
    },
    containerName: function(id) {
        return id + "container";
    },
    docTypes: function() {
        if (this.typeName()) {
            return DocumentTypes.find({
                name: {
                    '$regex': '.*' + this.typeName() + '.*',
                    '$options': 'i'
                }
            }).fetch();
        }
        return DocumentTypes.find().fetch();
    },
    events: {
        "click #cancel" () {
            var currentTypeID = Session.get("documentTypeExpiry");
            var oldTypeID = Session.get("oldDocumentTypeExpiry");
            var oldIndex = Session.get("oldIndexExpiry");
            var docId = Session.get("docIdExpiry");
            if (oldIndex == $("ul#" + oldTypeID).children().length) {
                $("ul#" + oldTypeID).append($("li#" + docId));
            } else {
                $("li#" + docId).insertBefore($("ul#" + oldTypeID).children()[oldIndex]);
            }
            $("li#" + docId).attr("data-moved", "false")
            $("#expiry-modal").closeModal();
        },
        "blur #expiresModal" (event) {
            validateDate("expiresModal", $("#expiresModal").val());
        },
        "click .toggle-type" (event) {

            $("li.open").toggleClass("open")
            var id = event.target.parentElement.id.replace("container", "").replace("Empty", "");
            if (id) {
                $("li#" + id + "").toggleClass("open");
            }
        },
        "submit form" (event) {
            event.preventDefault();
            validateDate("expiresModal", event.target.expires.value);
            // GET Document Info from session
            var agent = Router.current().params.agent_id;
            var currentTypeID = Session.get("documentTypeExpiry");
            var oldTypeID = Session.get("oldDocumentTypeExpiry");
            var oldIndex = Session.get("oldIndexExpiry");
            var docId = Session.get("docIdExpiry");

            // ONLY UPDATE IF EXPIRES FIELD IS SET
            if (event.target.expires.value) {
                if (!$("#expiresModal").hasClass("invalid")) {
                    // Update previous document type page numbers
                    if (oldTypeID != "nodoctype") {
                        var documents = Documents.find({
                            "agent": Router.current().params.agent_id,
                            "document_type_id": oldTypeID,
                            "page": {
                                $gt: oldIndex
                            }
                        }).fetch();
                        _.each(documents, function(document) {
                            Documents.update({
                                _id: document._id
                            }, {
                                "$set": {
                                    page: document.page - 1
                                }
                            });
                        });
                    }

                    // update document
                    // RESET DOCUMENTS MOVING TO UNCATEGORIZED
                    if (currentTypeID === "nodoctype") {
                        Documents.update({
                            _id: docId
                        }, {
                            "$set": {
                                page: 0
                            },
                            "$unset": {
                                document_type_id: "",
                                document_type_name: "",
                                expires: ""
                            }
                        });
                    } else {
                        var maxPage = Documents.findOne({
                            agent: Router.current().params.agent_id,
                            document_type_id: currentTypeID
                        }, {
                            sort: {
                                page: -1
                            },
                            limit: 1
                        })
                        var p = 0;
                        if (maxPage) {
                            p = maxPage.page + 1;
                        } else {
                            p = 0;
                        }
                        Documents.update({
                            _id: docId
                        }, {
                            "$set": {
                                page: p,
                                document_type_id: currentTypeID
                            }
                        });
                    }

                    if (agent) {
                        var docs = Documents.find({
                            "agent": agent,
                            "document_type_id": Session.get("documentTypeExpiry")
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
                    $("#expiry-modal").closeModal();

                } else {
                    $("#expiryError").show();
                }
            } else {
                $("#expiryError").show();
            }
        }
    }
});

var createSortable = function(element) {
    // var element = document.getElementById(currentTypeID);
    var id = Router.current().params.type_id;
    var documents = Documents.find({
        agent: Router.current().params.agent_id
    }).fetch();
    // var disable = false;
    // if (element.id === id) {
    //     disable = true
    // }
    var currentTypeID = element.id.replace("Side", "");
    var sortable = Sortable.create(element, {
        group: {
            name: "documents",
        },
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        handle: '.my-handle',
        animation: 150,
        onSort: function(event) {
            console.log("onsort here");
            event.item.setAttribute("data-moved", "true");
        },
        onAdd: function(event) {
            console.log("onAdd");
            var currentTypeID = event.to.id.replace("Side", "");
            var oldTypeID = event.from.id.replace("Side", "");
            //==========================================================
            // check if document type has expiry and show modal if not
            if (currentTypeID != "nodoctype") {
                var doc = Documents.findOne({
                    "agent": Router.current().params.agent_id,
                    "document_type_id": currentTypeID,
                    "expires": {
                        $exists: true
                    },
                    _id: {
                        $not: event.item.id
                    }
                });
                if (!doc) {
                    console.log("no");
                    console.log(currentTypeID);
                    $("#expiresModal").val("");
                    $("#expiryError").hide();
                    $("#expiry-modal").openModal({
                        dismissible: false
                    });
                    Session.set("documentTypeExpiry", currentTypeID);
                    Session.set("oldDocumentTypeExpiry", oldTypeID);
                    Session.set("oldIndexExpiry", event.oldIndex);
                    Session.set("docIdExpiry", event.item.id);
                } else {
                    console.log(currentTypeID);
                    // SHA3'AL ZAY EL FOLL
                    if (oldTypeID != "nodoctype") {
                        var documents = Documents.find({
                            "agent": Router.current().params.agent_id,
                            "document_type_id": oldTypeID,
                            "page": {
                                $gt: event.oldIndex
                            }
                        }).fetch();
                        _.each(documents, function(document) {
                            Documents.update({
                                _id: document._id
                            }, {
                                "$set": {
                                    page: document.page - 1
                                }
                            });
                        });
                    }

                    var documents = Documents.find({
                        agent: Router.current().params.agent_id
                    }).fetch();
                    // RESET DOCUMENTS MOVING TO UNCATEGORIZED
                    var maxPage = Documents.findOne({
                        agent: Router.current().params.agent_id,
                        document_type_id: currentTypeID
                    }, {
                        sort: {
                            page: -1
                        },
                        limit: 1
                    })
                    var p = 0;
                    if (maxPage) {
                        p = maxPage.page + 1;
                    } else {
                        p = 0;
                    }
                    Documents.update({
                        _id: event.item.id
                    }, {
                        "$set": {
                            page: p,
                            document_type_id: currentTypeID
                        }
                    });
                }
            } else {
                if (oldTypeID != "nodoctype") {
                    var documents = Documents.find({
                        "agent": Router.current().params.agent_id,
                        "document_type_id": oldTypeID,
                        "page": {
                            $gt: event.oldIndex
                        }
                    }).fetch();
                    _.each(documents, function(document) {
                        Documents.update({
                            _id: document._id
                        }, {
                            "$set": {
                                page: document.page - 1
                            }
                        });
                    });
                }

                Documents.update({
                    _id: event.item.id
                }, {
                    "$set": {
                        page: 0
                    },
                    "$unset": {
                        document_type_id: "",
                        document_type_name: "",
                        expires: ""
                    }
                });
            }
            //==========================================================
        },
        // onMove: function(event){
        //   console.log(event.to.id);
        //   return event.to.id.replace("Side","")!=event.from.id;
        // },
    });
    return sortable;
};
