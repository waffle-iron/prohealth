import './patients.html';

Template.patients.viewmodel({
    headerVariable: {
        title: "Patients",
        subtitle: "List of all patients",
        hasBack: false
    },
    startDate: moment(new Date("11/11/2016")).startOf("month"),
    endDate: moment(new Date("11/11/2016")).endOf("month"),
    onCreated() {
        Meteor.subscribe('patients');
    },

    onRendered() {
        var startDate = new Pikaday({
            field: $('#start-date')[0],
            format: "MM/DD/YYYY"
        });
        var endDate = new Pikaday({
            field: $('#end-date')[0],
            format: "MM/DD/YYYY"
        });
        //==========================================================
        // Initialize show entries select without materialize
        setTimeout(function() {
            $(".dataTables_length label select").toggleClass("browser-default");
            $(".dataTables_length label select").css("width", "auto");
            $(".dataTables_length label select").css("display", "inline-block");
            $('select').material_select();
        }, 100);
        //==========================================================
    },

    patientsTable() {
        return TabularTables.Patients;
    },
    routeQueryP: {},
    selector() {
        var query = {};
        if (Router.current().params.query)
            query = jQuery.extend(true, {}, Router.current().params.query);
        var agencies = [];
        // console.log(Router.current().params.query);
        // console.log(query["referalDate"]);

        if (query["referalDate"] && !query["referalDate"].$gte) {
            query["referalDate"] = {
                $gte: moment(query["referalDate"], "MM/DD/YYYY").utc().toDate(),
                $lte: moment(query["referalDate"], "MM/DD/YYYY").utc().add(1, 'days').toDate()
            };
        }

        if (query["start-date"] && query["end-date"]) {
            //removed UTC temporarily
            query["referalDate"] = {
                $gte: moment(query["start-date"], "MM/DD/YYYY").utc().startOf("day").toDate(),
                $lte: moment(query["end-date"], "MM/DD/YYYY").utc().endOf("day").utc().toDate()
            };
            delete query["start-date"];
            delete query["end-date"];
        }

        if (query['chartStatus'] && query['chartStatus'] == "Admitted") {
            query['chartStatus'] = {
                "$in": ['Admitted', 'Admitted W/O Con', 'Pre-Admit W/O Con', 'Pre-Admit', 'Pre-Recert', 'Recert', 'Transferred', 'Resumption', 'Revocation',
                    'Discharged W/O Con', 'DC wo ppw', 'Discharged', 'Live Discharge', 'Death Discharge'
                ]
            }
        }

        if (query['primaryInsurance'] == "Medicare") {
            if (query['type']) {
                if (query['type'] == "Hospice") {
                    query['primaryInsurance'] = 'Hospice Medicare';
                } else {
                    query['primaryInsurance'] = 'Medicare Home Health';
                }
            } else {
                query['primaryInsurance'] = {
                    $in: ["Medicare Home Health", "Hospice Medicare"]
                };
            }
        } else if (query['primaryInsurance'] == "Private") {
            query['primaryInsurance'] = {
                $nin: ["Medicare Home Health", "Hospice Medicare"]
            };
        }

        if (query['type']) {
            if (!query["agency"]) {
                if (query['type'] == "Hospice") {
                    agencies = ['ProHealth Hospice Sacramento', 'ProHealth Hospice Walnut Creek', 'ProHealth Hospice San Jose', 'ProHealth Hospice Stockton'];

                } else {
                    agencies = ['ProHealth Homecare Sacramento', 'ProHealth Homecare Walnut Creek', 'ProHealth Homecare San Jose', 'ProHealth Homecare Stockton'];
                }
                query["agency"] = {
                    $in: agencies
                };
            }
            delete query["type"];
        }
        // if(query["agency"]){
        //
        // }
        // console.log(query);
        // console.log(Router.current().params.query);

        return query;
    },
    searchFields() {
        return ['patient'];
    },
    fields() {
        return [{
            key: 'patient',
            label: "Name"
        }];
    },
    updating() {
        setting = PatientsSettings.findOne({
            key: 'updating'
        });
        if (setting && setting.value) {
            return {
                disabled: 'disabled'
            };
        } else {
            return {};
        }
    },
    tableData: "",
    getTableData: function() {
        var self = this;
        var filters = "";

        var query = this.filter();
        if (this.selector() && this.filterText()) {
            query = {
                $and: [this.selector(), this.filter()]
            }
        } else if (this.selector()) {
            query = this.selector()
        }

        Meteor.call("exportAllPatients", query, "mrn,patient,chartStatus,agency,primaryInsurance,marketer,referalDate", function(error, data) {
            var csv = Papa.unparse(data);
            tData = "Patients\n"
            var query = Router.current().params.query;
            if (query) {
                for (var property in query) {
                    if (query.hasOwnProperty(property)) {
                        filters += "\n" + property + ": " + query[property];
                    }
                }
                filters += "\n";
            }
            if (self.filterText())
                filters += "Filtering by:," + self.filterText() + "\n";
            tData += filters + csv;
            self.tableData(tData);
        });
    },
    exportAllPatients: function() {
        var self = this;
        var filters = "";

        var query = this.filter();
        if (this.selector() && this.filterText()) {
            query = {
                $and: [this.selector(), this.filter()]
            }
        } else if (this.selector()) {
            query = this.selector()
        }

        Meteor.call("exportAllPatients", query, "mrn,patient,chartStatus,agency,primaryInsurance,marketer,referalDate", function(error, data) {
            var csv = Papa.unparse(data);
            tData = "Patients\n"
            var query = Router.current().params.query;
            if (query) {
                for (var property in query) {
                    if (query.hasOwnProperty(property)) {
                        filters += "\n" + property + ": " + query[property];
                    }
                }
                filters += "\n";
            }
            if (self.filterText())
                filters += "Filtering by:," + self.filterText() + "\n";
            tData += filters + csv;
            self._downloadCSV(tData);
        });
    },

    _downloadCSV: function(csv) {
        var blob = new Blob([csv]);
        var a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(blob, {
            type: "text/plain"
        });
        a.download = "Patients.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },
    filter: {},
    filterText: "",
    events: {
        'click #sendmail' (event) {
            this.getTableData();
            console.log(Router.current().params.query);
            this.routeQueryP(Router.current().params.query);
            $('#modal1').openModal();
        },
        "change #patients-table_filter": function(e) {
            // console.log();
            var filterValue = e.target.value;
            this.filterText(e.target.value);

            var filter = {
                $or: [{
                    patient: {
                        '$regex': '.*' + filterValue + '.*',
                        '$options': 'i'
                    }
                }, {
                    mrn: {
                        '$regex': '.*' + filterValue + '.*',
                        '$options': 'i'
                    }
                }, {
                    chartStatus: {
                        '$regex': '.*' + filterValue + '.*',
                        '$options': 'i'
                    }
                }, {
                    agency: {
                        '$regex': '.*' + filterValue + '.*',
                        '$options': 'i'
                    }
                }, {
                    primaryInsurance: {
                        '$regex': '.*' + filterValue + '.*',
                        '$options': 'i'
                    }
                }, {
                    marketer: {
                        '$regex': '.*' + filterValue + '.*',
                        '$options': 'i'
                    }
                }]
            }
            // console.log(Bills.find(filter).fetch());
            this.filter(filter);
        },
        'click #update-date button' (event, instance) {
            Meteor.call('patients.update', moment(new Date("11/11/2016")).startOf("month").format("MM/DD/YYYY"), moment(new Date("12/11/2016")).endOf("month").format("MM/DD/YYYY"), 10000);
        },
        "click .download-patients" () {
            console.log("ButtonClicked");
            this.exportAllPatients();
        },
    }
});
