var uploadSeparateFiles = function(agent_id, fileName) {
    var imgs = Session.get("canvases");

    var i = Session.get("pageCounter");
    var dataurl = imgs[0];
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    var blob = new Blob([u8arr], {
        type: mime
    });
    var p = i < 10 ? "0" + i : i;
    var fName = fileName + " - " + p + ".jpg";
    var f = new File([blob], fName);

    S3.upload({
        file: f,
        path: "test"
    }, function(e, r) {
        if (e) {
            sAlert.error('Error !', {
                position: 'top-right',
                offset: "60px",
                effect: 'scale'
            });
            return;
        } else {
            // console.log(r);
            Documents.insert({
                agent: agent_id,
                url: r.url,
                name: fName,
                page: 0
            });
            imgs.shift();
            Session.set("canvases", imgs);
            if (imgs.length > 0) {
                i++;
                Session.set("pageCounter", i);
                uploadSeparateFiles(agent_id, fileName);
            } else {
                sAlert.success('Document added successfully!', {
                    position: 'top-right',
                    offset: "60px",
                    effect: 'scale'
                });
                $(".file_bag").attr("disabled", false);
            }
        }
    });
}


var parse = function(fileInfo, agent_id) {
    //parsing images
    //=================================
    console.log("parsing");
    var url = fileInfo.url;
    if (PDFJS) {
        //  console.log(PDFJS);
        PDFJS.workerSrc = '/packages/pascoual_pdfjs/build/pdf.worker.js';
        PDFJS.getDocument(url).then(function getPdfHelloWorld(pdf) {
            //console.log("pdf");
            // Fetch the each page
            Session.set(url, 1);
            Session.set("canvases", []);
            for (var p = 1; p <= pdf.numPages; p++) {
                S3.collection.remove({});
                pdf.getPage(p).then(function getPageHelloWorld(page) {
                    var scale = 1;
                    // console.log(page);
                    var viewport = page.getViewport(scale);
                    var canvas = document.createElement("canvas");
                    canvas.setAttribute("id", "pdfcanvas" + page.pageIndex);
                    // Prepare canvas using PDF page dimensions
                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render PDF page into canvas context
                    page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise.then(function() {
                        var page = Session.get(url);
                        start = "data:image/png;base64,".length;
                        var imgs = [];
                        var arr = Session.get("canvases");
                        arr.push(canvas.toDataURL());
                        Session.set("canvases", arr)
                        if (arr.length == pdf.numPages) {
                            Session.set("pageCounter", 1);
                            uploadSeparateFiles(agent_id, fileInfo.file.original_name.replace('.pdf', ''))
                        }
                        Session.set(url, Session.get(url) + 1);
                        var imgDataUrl = canvas.toDataURL().substring(start, canvas.toDataURL().length);

                    });
                }); // END GET PAGE

                // $(".docProg").css("width",0);
            } // END EACH PAGE
        }); // END GET DOCUMENT
        Session.set(fileInfo.url, "");

    } // END IF PDFJS
}

Template.agentEditDocuments.viewmodel({
    path: "",
    files: function() {
        return S3.collection.find();
    },
    upload: function() {
        var agent_id = this._id();
        return {
            finished: function(index, fileInfo, context) {
                parse(fileInfo, agent_id);
            }
        };
    },
    agent_id: function() {
        return this.templateInstance.data._id;
    },
    onCreated: function() {
        Uploader.init(this.templateInstance);
        this.templateInstance.subscribe("agentDocumentsFields", this.templateInstance.data._id);
    },
    onRendered: function() {
        S3.collection.remove({});

    },
    documentsExist: function() {
        var docs = Documents.find({
            "agent": this._id()
        }).fetch();
        return docs.length > 0;
    },
    nDocs: function() {
        var docs = Documents.find({
            "agent": this._id()
        }).fetch();
        return docs.length;
    },
    documentsWithUniqTypes: function() {
        console.log(this._id());
        var arr = Documents.find({
            "agent": this._id()
        }).fetch();
        var distinctArray = _.uniq(arr, false, function(d) {
            return d.document_type_id
        });
        var disctinctTypes_docID = _.pluck(distinctArray, '_id');
        console.log(Documents.find({
            _id: {
                $in: disctinctTypes_docID
            }
        }).fetch());
        return Documents.find({
            _id: {
                $in: disctinctTypes_docID
            }
        });
        // Documents.find({_id: { $in: expiring_document_ids}}).fetch().length;
    },
    events: {
        "click button.upload": function() {
            $(".upload").attr("disabled", true);
            $(".file_bag").attr("disabled", true);
            // CLEAN UP
            Session.set("imgs", []);
            $("#images").empty();
            var files = $("input.file_bag")[0].files
            var agent_id = this._id();

            S3.upload({
                files: files,
                path: "test"
            }, function(e, r) {
                console.log(r);
                sAlert.success('Document uploaded!', {
                    position: 'top-right',
                    offset: "60px",
                    effect: 'scale'
                });
                sAlert.success('Saving Document, please wait..', {
                    position: 'top-right',
                    offset: "60px",
                    effect: 'scale'
                });
                parse(r, agent_id);

            });
        },
        "click .start": function() {
            // CLEAN UP
            Session.set("imgs", []);
            $("#images").empty();
        },
        "change .file_bag": function(e) {
            if (e.target.files[0].type != "application/pdf") {
                $(".upload").attr("disabled", true);
                if (!$(".file-path-wrapper .file-path.isPDF").hasClass("invalid")) {
                    $(".file-path-wrapper .file-path.isPDF").toggleClass("invalid");
                }
                $(".file-error").show();
            } else {
                $(".file-error").hide();
                if ($(".file-path-wrapper .file-path.isPDF").hasClass("invalid")) {
                    $(".file-path-wrapper .file-path.isPDF").toggleClass("invalid");
                }

                if (e.target.files.length > 0) {
                    $(".upload").attr("disabled", false);
                    S3.collection.remove({});
                }
            }
        }
    }

});

Template.agentEditDocumentsCollectionItem.viewmodel({

    getURLData() {
        if (this.document_type_id)
            return {
                agent_id: this.agent(),
                document_type_id: this.document_type_id()
            };
        else
            return {
                agent_id: this.agent()
            };
    },

    numberOfDocsPerType: function(docType, agent) {

        return Documents.find({
            "agent": agent,
            "document_type_id": docType
        }).fetch().length;
    }

});
