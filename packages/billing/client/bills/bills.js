function parse(fileInfo) {
    //parsing images
    //=================================
    parseDate = function(dt) {
        return moment(dt.slice(0, 2) + "-" + dt.slice(2, 4) + "-" + dt.slice(4, 6), "MM-DD-YYYY").startOf('day')._d
    };
    // TABLE HEADER
    var fieldNames = [
        "Patient Name", "Patient CNTRL Number", "FRM DT",
        "Cost", "REPTD CHGS",
        //  "DRG NBR",
        "Outlier AMT",
        "Reimb Rate", "Allow / REIM", "Interest",
        "ICN Number", "HIC Number", "THR DT",
        "COVDV", "NCVD/Denied",
        "DRG AMT", "Deductibles",
        "MSP PRI Pay", "Proc CD Amt",
        "Pat Refund", "CLM Status", "Medical Rec Number",
        "Pat ST", "NCVDV", "Claim ADJS",
        "DRG O-C", "COINS AMT",
        "Prof Comp", "Line ADJ AMT",
        "Per Diem AMT", "Name Change=XX",
        "Hic CHG=X | TOB", "CV LN",
        "NCVL", "COVD CHGS",
        "New Tech", "MSP Liab Met",
        "ESRD AMT", "CONT ADJ AMT",
        "Net REIM", "Ntl Provider ID"
    ]

    Session.set("allBillText", []);
    Session.set("isBill", false);
    PDFJS.workerSrc = '/packages/pascoual_pdfjs/build/pdf.worker.js';
    PDFJS.getDocument(fileInfo.url).then(function getPdf(pdf) {
        for (var p = 1; p <= pdf.numPages; p++) {
            pdf.getPage(p).then(function getPage(page) {
                page.getTextContent().then(function(textContent) {
                    // console.log(textContent);
                    // FIND AND SET BILL DATE
                    for (var i = 0; i < textContent.length; i++) {
                        if (textContent[i].str === "CHECK DATE:") {
                            Session.set("billDate", textContent[i + 1].str);
                        }
                    }
                    // FETCH DATA IN OBJECTS
                    if (null != textContent) {
                        var counter = 0;
                        var billObj = {};

                        //FILTERING DATA
                        for (var k = 0; k < textContent.length; k++) {
                            var block = textContent[k];
                            // END OF TABLE CONTENT STARTS WITH EITHER "NATIONAL GOVERNMENT SERVICES"
                            // OR "TOTALS:"
                            if (block.str.includes("NATIONAL GOVERNMENT SERVICES")) {
                                Session.set("isBill", true);
                                break;
                            } else if (block.str.includes("TOTALS:")) {
                                break;
                            } else if (counter <= 40) {
                                billObj[fieldNames[counter]] = block.str;
                                var items = Session.get("allBillText");

                                if (counter == 40) {
                                    items.push(billObj)
                                    billObj.billDate = Session.get("billDate");
                                    Session.set("allBillText", items);
                                }
                                counter++;
                            } else if (counter > 40 && counter <= 47) {
                                counter++;
                            } else if (counter > 47) {
                                billObj = {}
                                counter = 0;
                                billObj[fieldNames[counter]] = block.str;
                                counter++;
                            }
                        }

                        // IF LAST ENTRY IN LAST PAGE START INSERTING DATA
                        if (page.pageNumber == pdf.numPages) {
                            console.log("here");
                            if (Session.get("isBill")) {
                                insertData(Session.get("allBillText"));
                            } else {
                                sAlert.error('Error! Invalid file !', {
                                    position: 'top-right',
                                    offset: "60px",
                                    effect: 'scale'
                                });
                            }
                        }
                    }
                })
            }); // END GET PAGE
        } // END EACH PAGE
    }); // END GET DOCUMENT

    //======================================================================
    // INSERTING DATA TO BILLS TABLE
    function insertData(allDataRows) {
        var count = 1;
        duplicateBills = false;
        _.each(allDataRows, function(billObj) {
            // CLEANUP PATIENT NAME
            var name = (billObj["Patient Name"]).replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            })
            // GET PATIENT MEDICAL RECORD NUMBER
            var patMrn = billObj["Medical Rec Number"];
            // FIND PATIENT
            var patient = Patients.findOne({
                mrn: patMrn
            });
            // IF NOT FOUND INSERT
            if (!patient) {
                patient = Patients.insert({
                    patient: name,
                    mrn: patMrn
                });
            } else {
                patient = patient._id;
            }

            // CLEAN UP CLAIM
            var clm = billObj["Hic CHG=X | TOB"];
            var claimName = clm.substring(clm.indexOf("|") + 2, clm.length);
            // FIND CLAIM
            var claim = Claims.findOne({
                name: claimName
            });
            // IF NOT FOUND INSERT
            if (claim) {
                claim = claim._id;
            } else {
                claim = Claims.insert({
                    "name": clm.substring(clm.indexOf("|") + 2, clm.length)
                });
            }
            // SET PAYOR TO MEDICARE
            var payor = Payors.findOne({
                "name": "Medicare"
            })._id;
            if (!duplicateBills) {
                var bill = Bills.findOne({
                    "patient_name": name,
                    "claim_start_date": parseDate(billObj["FRM DT"]),
                    "claim_end_date": parseDate(billObj["THR DT"]),
                    "claim_id": claim,
                    "date": moment(billObj.billDate, "MM/DD/YYYY").startOf('day')._d
                });
                if (bill)
                    duplicateBills = true;
            }
            Bills.insert({
                "date": billObj.billDate,
                "payor_id": payor,
                "patient_id": patient,
                "patient_name": name,
                "claim_start_date": parseDate(billObj["FRM DT"]),
                "claim_end_date": parseDate(billObj["THR DT"]),
                "claim_id": claim,
                "amount": billObj["Net REIM"]
            });
            if (count == allDataRows.length) {
                sAlert.success('Processing Done!', {
                    position: 'top-right',
                    offset: "60px",
                    effect: 'scale'
                });
                console.log(Bills.find().fetch());
                if (duplicateBills) {
                    sAlert.error('Duplicate Bills were not added!', {
                        position: 'top-right',
                        offset: "60px",
                        effect: 'scale'
                    });
                }
            }
            count++;
        });
    }
    //======================================================================

}

Template.bills.viewmodel({
    patient: '',
    headerVariable: {
        title: "Bills",
        subtitle: "List of all bills",
        hasBack: false
    },
    onCreated() {
        this.templateInstance.subscribe("payors")
        //this.templateInstance.subscribe("patients")
        this.templateInstance.subscribe("claims")
    },
    onRendered() {
        //==========================================================
        // Initialize show entries select without materialize
        setTimeout(function() {
            $(".dataTables_length label select").toggleClass("browser-default");
            $(".dataTables_length label select").css("width", "auto");
            $(".dataTables_length label select").css("display", "inline-block");
        }, 500);
        //==========================================================
    },

    autorun() {
        //==========================================================
        // Initialize show entries select without materialize
        setTimeout(function() {
            $(".dataTables_length label select").toggleClass("browser-default");
            $(".dataTables_length label select").css("width", "auto");
            $(".dataTables_length label select").css("display", "inline-block");
        }, 500);
        //==========================================================

    },

    bills: function() {
        return TabularTables.Bills;
    },
    filter: {},
    billsSelector: function() {
        var params = Router.current().params.query;
        var models = {
            "claim": Claims,
            "payor": Payors,
            "patient": Patients
        }
        filters = {};

        if (params.hasOwnProperty("from")) {
            filters["date"] = {
                "$gte": new moment(params["from"], "MM/DD/YYYY").startOf("day").utc().toDate()
            };
        }
        if (params.hasOwnProperty("to")) {
            filters["date"] = filters["date"] || {};
            Object.assign(filters["date"], {
                "$lte": new moment(params["to"], "MM/DD/YYYY").endOf("day").utc().toDate()
            });
        }
        if (params.hasOwnProperty("payor")) {
            filters["payor_name"] = params["payor"];
        }
        if (params.hasOwnProperty("claim")) {
            filters["claim_name"] = params["claim"];
        }

        if (params.hasOwnProperty("patient")) {
            filters["patient_name"] = params["patient"];
        }
        if (this.patient()) {
            filters["patient_name"] = {
                '$regex': '.*' + this.patient() + '.*',
                '$options': 'i'
            };
        }
        var filter,
            obj;


        switch (params["payment"]) {
            case 'none':

                filters["paymentsAmount"] = {
                    $eq: 0
                };
                break;
            case 'partial':
                filters["paid"] = false;
                filters["paymentsAmount"] = {
                    $gt: 0
                };
                break;
            case 'full':
                filters["paid"] = true;
                break;
        }
        console.log(filters);
        return filters;
    },

    upload: function() {
        return {
            finished: function(index, fileInfo, context) {
                console.log("DONE uploading");
                console.log(fileInfo);
                Meteor.call("parseTable", fileInfo);
            }
        };
    },

    exportAllBills: function() {
        var self = this;
        Meteor.call("exportAllBills", self.billsSelector(), "patient_name,payor_name,claim_name,date,claim_start_date,claim_end_date,amount", function(error, data) {
            var csv = Papa.unparse(data);
            // console.log(data);
            self._downloadCSV(csv);
        });
    },

    _downloadCSV: function(csv) {
        var blob = new Blob([csv]);
        var a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(blob, {
            type: "text/plain"
        });
        a.download = "bills.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    // UPLOAD
    infoLabel: "",

    file: function() {
        var files = S3.collection.find().fetch();
        console.log(files);
        return files[0];
    },
    events: {
        "change #billsTable_filter": function(e) {
            // console.log();
            var filterValue = e.target.value;
            var filter = {
                $or: [{
                    patient_name: {
                        '$regex': '.*' + filterValue + '.*',
                        '$options': 'i'
                    }
                }, {
                    agency_name: {
                        '$regex': '.*' + filterValue + '.*',
                        '$options': 'i'
                    }
                }, {
                    claim_name: {
                        '$regex': '.*' + filterValue + '.*',
                        '$options': 'i'
                    }
                }, {
                    payor_name: {
                        '$regex': '.*' + filterValue + '.*',
                        '$options': 'i'
                    }
                }, {
                    amount: filterValue
                }, {
                    paymentsAmount: filterValue
                }]
            }
            // console.log(Bills.find(filter).fetch());
            this.filter(filter);
        },
        "click .close": function() {
            this.infoLabel("");
            $(".file_bag").val("")
        },
        "click .download-patients" () {
            console.log("ButtonClicked");
            this.exportAllBills();
        },
        "click .file_bag": function(e) {
            $(".file_bag").val("")
            this.infoLabel("");
            S3.collection.remove({});
        },
        "change .file_bag": function(e) {
            console.log(e.target);
            if (e.target.files[0].type != "application/pdf") {
                sAlert.error('Invalid file, only pdf files allowed !', {
                    position: 'top-right',
                    offset: "60px",
                    effect: 'scale'
                });
            } else {
                if (e.target.files[0]) {
                    this.infoLabel(e.target.files[0].name)
                    console.log(e.target.files[0].name); //files used in upload
                    $(".upload").prop('disabled', false);

                } else {
                    this.infoLabel("")
                }
            }
        },
        "click button.upload": function() {
            // CLEAN UP
            // Session.set("imgs", []);
            // $("#images").empty();
            $(".upload").prop('disabled', true);
            var files = $("input.file_bag")[0].files
            console.log($("input.file_bag")[0].files);
            //  var agent_id = this._id();
            //  console.log(agent_id);
            S3.upload({
                files: files,
                path: "subfolder"
            }, function(e, r) {
                // console.log(r);
                sAlert.success('File uploaded successfully!', {
                    position: 'top-right',
                    offset: "60px",
                    effect: 'scale'
                });
                sAlert.success('Processing, please wait !', {
                    position: 'top-right',
                    offset: "60px",
                    effect: 'scale'
                });

                parse(r)

                //  parse(r, agent_id );
            });
        },
    }
});
