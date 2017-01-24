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

Template.types.viewmodel({
    docId: "",
    zoomValue: 0,
    minValue: 0,
    maxValue: 100,
    onCreated() {},
    autorun() {
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
            if (angle == 270 || angle == -90) {
                $("#imgContainer").css("direction", "rtl")
            } else {
                $("#imgContainer").css("direction", "ltr")
            }
        });
    },
    zoomF: function() {
        $('#docImage').width(this.zoomValue());
    },
    width() {
        var z = this.zoomValue();
        return z + "%"
    },
    document: function(id) {
        if (id) {
            var doc = Documents.findOne({
                _id: id,
                document_type_id: Router.current().params.type_id
            });
            if (doc)
                return doc;
            else {
                doc = Documents.findOne({
                    document_type_id: Router.current().params.type_id,
                    page: 0
                });
                return doc;
            }
        } else {
            doc = Documents.findOne({
                document_type_id: Router.current().params.type_id,
                page: 0
            });
            return doc;
        }
    },
    pikadayCh: "",
    clearPikaday: function() {
        this.pikadayCh("");
    },
    pikaDayLoad() {
        // console.log("hello autrun");
        if ($("#expiresType").hasClass("invalid"))
            $("#expiresType").toggleClass("invalid")
        var _this = this;
        setTimeout(function() {
            if (document.getElementById("expiresType")) {
                if (_this.pikadayCh() === "") {
                    _this.pikadayCh(new Pikaday({
                        field: document.getElementById("expiresType"),
                        format: 'MM/DD/YYYY'
                    }));
                }
            }
        }, 200);

    },
    dataurl: function(url) {
        return "data:image/png;base64," + url;
    },
    notThisDocType: function(id) {
        if (Router.current().params.type_id != id)
            return true;
        return false;
    },
    docType: function() {
        return DocumentTypes.findOne({
            _id: Router.current().params.type_id
        });
    },
    reloadSortable: function() {
        setTimeout(function() {
            var documentContainers = document.getElementsByClassName("documents");
            // console.log(documentContainers);
            _.each(documentContainers, function(element) {
                createSortable(element);
            });
        }, 600);
    },
    containerName: function(id) {
        return id + "container";
    },
    expiry: function(document_type_id) {
        var doc = Documents.findOne({
            agent: Router.current().params.agent_id,
            document_type_id: document_type_id
        });

        if (doc) {
            if (doc.expires)
                return moment(doc.expires).format("MM/DD/YYYY");
            else {
                $("#expiresType").val("")
                return "";
            }
        }
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

        // console.log(rotation);
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
        "blur #expiresType" (event) {
            validateDate("expiresType", $("#expiresType").val());
        },
        "click .doc-item" (event) {
            this.docId(event.target.id);
            $("#docImage").css("width", "auto")
        },
        "click .rotateDoc" (event) {
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
                if (!$("#expiresType").hasClass("invalid")) {
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
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        handle: ".my-handle",
        animation: 150,
        onSort: function(event) {
            // var newTypeID = "";
            console.log(event);
            var doc = Documents.findOne({
                _id: event.item.id
            })
            console.log(doc);
            // //If sorting within same type
            if (event.to.id === event.from.id) {
                console.log("here");
                if (event.item.getAttribute("data-moved") === "false") {
                    console.log("here");
                    if (currentTypeID != "nodoctype") {
                        if (doc.page > event.newIndex) {
                            var docsInBetween = Documents.find({
                                document_type_id: doc.document_type_id,
                                agent: doc.agent,
                                page: {
                                    $gte: event.newIndex,
                                    $lt: doc.page
                                }
                            }).fetch();
                            _.each(docsInBetween, function(d) {
                                Documents.update({
                                    _id: d._id
                                }, {
                                    $set: {
                                        page: d.page + 1
                                    }
                                })
                            });
                        } else if (doc.page < event.newIndex) {
                            var docsInBetween = Documents.find({
                                document_type_id: doc.document_type_id,
                                agent: doc.agent,
                                page: {
                                    $lte: event.newIndex,
                                    $gt: doc.page
                                }
                            }).fetch();
                            _.each(docsInBetween, function(d) {
                                Documents.update({
                                    _id: d._id
                                }, {
                                    $set: {
                                        page: d.page - 1
                                    }
                                })
                            });
                        }

                        Documents.update({
                            _id: doc._id
                        }, {
                            "$set": {
                                page: event.newIndex
                            }
                        });
                    }
                } else {
                    var documents = Documents.find({
                        document_type_id: doc.document_type_id,
                        agent: doc.agent,
                        page: {
                            $lte: event.newIndex,
                            $gt: event.oldIndex
                        }
                    }).fetch();
                    _.each(documents, function(document) {
                        // decrement all elements between oldIndex and newIndex
                        if (document.page <= event.newIndex && document.page > event.oldIndex) {
                            if (document.document_type_id === currentTypeID) {
                                Documents.update({
                                    _id: document._id
                                }, {
                                    "$set": {
                                        page: document.page - 1
                                    }
                                });
                            }
                        }
                    });
                }
            } else {
                // MOVING OUT OF COLLECTION
                console.log("moving item out of collection");
                $("#" + event.item.id).attr("data-moved", "true")
            }
        },
        onRemove: function(event) {

        },
        onMove: function(event) {
            // console.log(event.to.id);
            return event.to.id != (event.from.id + "Side");
        },
    });
};
