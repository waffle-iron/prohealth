Template.nodoctype.viewmodel({
    zoomValue: 0,
    minValue: 0,
    maxValue: 100,
    onCreated() {
        this.templateInstance.subscribe("agentDocumentsType", Router.current().params.agent_id, Router.current().params.type_id);
    },
    onRendered() {
        var _this = this;
        setTimeout(function() {
            var img = document.getElementById('docImage');
            if (img) {
                var width = img.clientWidth;
                _this.zoomValue(width);
                _this.minValue(width);
                _this.maxValue(width * 2.5);
            }
            img.onload = function() {
                console.log("onload");
                _this.zoomValue(this.width);
                _this.minValue(this.width);
                _this.maxValue(this.width * 2.5);
            }
            var rot = $("#docImage").css("transform").split('(')[1].split(')')[0].split(',')[1];
            var angle = Math.round(Math.asin(rot) * (180 / Math.PI));
            // console.log(angle);
            if (angle == 270 || angle == -90) {
                $("#imgContainer").css("direction", "rtl")

            } else {
                $("#imgContainer").css("direction", "ltr")
            }
        }, 1000);
    },
    zoomF: function() {
        $('#docImage').width(this.zoomValue());
    },
    docId: "",
    defaultId: function() {
        if (Documents.findOne({
                agent: Router.current().params.agent_id,
                document_type_id: {
                    $exists: false
                }
            }))
            this.docId(Documents.findOne({
                agent: Router.current().params.agent_id,
                document_type_id: {
                    $exists: false
                }
            })._id)
        else {
            this.docId("");
        }
    },
    document: function(id) {
        var doc = Documents.findOne({
            $and: [{
                    _id: id
                },
                {
                    document_type_id: {
                        $exists: false
                    }
                }
            ]
        });
        if (doc) {
            return doc;
        } else {
            doc = this.documentsNoType()[0]
            return doc;
        }
    },
    reloadSortable: function() {
        setTimeout(function() {
            var documentContainers = document.getElementsByClassName("documents");
            // console.log(documentContainers);
            _.each(documentContainers, function(element) {
                createSortable(element);
            });
        }, 1000);
    },
    dataurl: function(url) {
        if (url)
            return "data:image/png;base64," + url;
    },
    containerName: function(id) {
        return id + "container";
    },
    documentsNoType: function() {
        var agent = Router.current().params.agent_id;
        // if (Router.current().params.document_type_id) {
        return Documents.find({
            agent: agent,
            document_type_id: {
                $exists: false
            }
        }, {
            sort: {
                name: 1
            }
        }).fetch();
    },
    formId: function(id) {
        return id + "docType";
    },
    docTypes: function() {
        var docTypes = DocumentTypes.find().fetch();
        return docTypes;
    },
    adjWidth: function(id) {
        var doc = Documents.findOne({
            _id: id
        });
        var rotation = doc.rotation;

        console.log(rotation);
        if (rotation == 90 || rotation == 270) {
            return "6rem"
        } else {
            return "auto"
        }
        // img.css("width", rotation !=0 ? "auto" : "6rem !important");
    },
    chckURL: function(url) {
        if (url.includes("http")) {
            return url;
        } else {
            return this.dataurl(url);
        }
    },
    events: {
        "click .doc-item" (event) {
            console.log(event.target.id);
            this.docId(event.target.id);
            $("#docImage").css("width", "auto")
        },
        "click .rotateDoc" (event) {
            console.log("here");
            var doc = Documents.findOne({
                _id: event.target.getAttribute("data-docId")
            });
            if (doc.rotation == 270) {
                Documents.update({
                    _id: event.target.getAttribute("data-docId")
                }, {
                    $set: {
                        rotation: 0
                    }
                });
            } else {
                Documents.update({
                    _id: event.target.getAttribute("data-docId")
                }, {
                    $set: {
                        rotation: doc.rotation + 90
                    }
                });
            }
            if (doc.rotation == 180) {
                $("#imgContainer").css("direction", "rtl")
            } else {
                $("#imgContainer").css("direction", "ltr")
            }
            this.zoomValue(0);
        },
        "click #pagesInc" () {
            this.nDocs(parseInt($("#col-size").val()) + 1)
            if (this.nDocsPreValue() == 6 || this.nDocsPreValue() == 4) {
                this.nDocs(6);
            }
            $("#col-size").val(this.nDocs());
            this.nDocsPreValue($("#col-size").val());
        },
        "click #pagesDec" () {
            this.nDocs($("#col-size").val() - 1)
            if (this.nDocs() == 5) {
                this.nDocs(4);
                // $("#col-size").val(this.nDocs())
            } else if (this.nDocs() == 0) {
                this.nDocs(1);
            }
            $("#col-size").val(this.nDocs());
            this.nDocsPreValue($("#col-size").val());
        },
        "submit form" (event) {
            event.preventDefault();

            if (event.target.expires) {
                var agent = Router.current().params.agent_id;
                if (agent) {
                    var docs = Documents.find({
                        "agent": agent,
                        "document_type_id": event.target.getAttribute("data-docTypeId")
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
});
var createSortable = function(element) {
    // var element = document.getElementById(currentTypeID);
    var documents = Documents.find({
        agent: Router.current().params.agent_id
    }).fetch();

    var currentTypeID = element.id;
    Sortable.create(element, {
        group: {
            name: "documents",
        },
        chosenClass: "sortable-chosen",
        dragClass: "sortable-drag",
        handle: ".my-handle",
        animation: 150,
        onAdd: function(event) {
            console.log("onAdd");
            var currentTypeID = event.to.id;
            var documents = Documents.find({
                agent: Router.current().params.agent_id
            }).fetch();
            // RESET DOCUMENTS MOVING TO UNCATEGORIZED
            if (currentTypeID === "nodoctype") {
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
            } else {
                // IF COLLECTION HAS ONLY ONE DOCUMENT SET ORDER TO 0
                if (event.to.childElementCount == 0) {
                    Documents.update({
                        _id: event.item.id
                    }, {
                        "$set": {
                            page: 0,
                            document_type_id: currentTypeID
                        }
                    });
                } else {
                    Documents.update({
                        _id: event.item.id
                    }, {
                        "$set": {
                            // page: event.newIndex,
                            document_type_id: currentTypeID
                        }
                    });
                }
            }
        },
        onMove: function(event) {
            // console.log(event.to.id);
            return event.to.id != (event.from.id + "Side");
        },
    });
};
