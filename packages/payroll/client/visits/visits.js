import './visits.html';

let date_regex = /((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d)|((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])(19|20)\d\d)/;
var validateDate = function(id, value) {
    if (!date_regex.test(value) && value) {
        if (!$("#" + id).hasClass("invalid"))
            $("#" + id).toggleClass("invalid");
    } else {
        if ($("#" + id).hasClass("invalid"))
            $("#" + id).toggleClass("invalid");
    }
};

Template.visits.viewmodel({
    headerVariable: {
        title: "Visits List",
        subtitle: "List of all visits within date range",
        hasBack: false
    },
    startDate: moment().startOf("week").utc().format("MM/DD/YYYY"),
    endDate: moment().endOf("week").utc().format("MM/DD/YYYY"),
    loadingStatus: false,
    invalidDates: function() {
        return !moment(this.startDate(), "MM/DD/YYYY").isValid() || !moment(this.endDate(), "MM/DD/YYYY").isValid()
    },
    onRendered() {
        Materialize.updateTextFields();
        //==========================================================
        // Initialize show entries select without materialize
        setTimeout(function() {
            $(".dataTables_length label select").toggleClass("browser-default");
            $(".dataTables_length label select").css("width", "auto");
            $(".dataTables_length label select").css("display", "inline-block");
            $("select").material_select();
        }, 100);
        //==========================================================
        var startDate = new Pikaday({
            field: $('#start-date')[0],
            format: "MM/DD/YYYY"
        });
        var endDate = new Pikaday({
            field: $('#end-date')[0],
            format: "MM/DD/YYYY"
        });

        if (moment(this.startDate(), "MM/DD/YYYY").isAfter(moment(this.endDate(), "MM/DD/YYYY"))) {
            console.log("error");
            $("#end-date").addClass("invalid");
            $("#start-date").addClass("invalid");
            $(".date-error").show()
        } else {
            $("#end-date").removeClass("invalid");
            $("#start-date").removeClass("invalid");
            $(".date-error").hide()
        }
    },
    supervisedAgents: function() {
        var agents = [];
        _.each(Session.get("supAgents"), function(agent) {
            agents.push(agent.name);
        });
        return agents;
    },
    query() {
        var query = {};
        var routerQuery = jQuery.extend(true, {}, Router.current().params.query);

        if (Object.getOwnPropertyNames(routerQuery).length > 0) {
            if (routerQuery["start-date"] && routerQuery["end-date"]) {
                this.startDate(routerQuery["start-date"]);
                this.endDate(routerQuery["end-date"]);
                query["formDate"] = {
                    $gte: moment(routerQuery["start-date"], "MM/DD/YYYY").startOf("day").utc().toDate(),
                    $lte: moment(routerQuery["end-date"], "MM/DD/YYYY").endOf("day").utc().toDate()
                };
            }
            if (routerQuery["agency"]) query["agency"] = routerQuery["agency"];
            if (routerQuery["insurance"]) query["insurance"] = routerQuery["insurance"];
            if (routerQuery["patient"]) query["patient"] = routerQuery["patient"];

            if (routerQuery["user"]) {
                if (routerQuery["user"] == "supervisedAgents") {
                    query["user"] = {
                        $in: this.supervisedAgents()
                    }
                } else
                    query["user"] = routerQuery["user"];
            }
            if (routerQuery["form"]) query["form"] = routerQuery["form"]
            if (routerQuery["billingState"]) query["billingState"] = routerQuery["billingState"]
            if (routerQuery["visitType"]) {
                if (routerQuery["visitType"] == "nonRegular") {
                    query["$or"] = [{
                            complex: {
                                $eq: true
                            }
                        },
                        {
                            out_of_area: {
                                $eq: true
                            }
                        },
                    ]
                } else if (routerQuery["visitType"] == "regular") {
                    query["$and"] = [{
                            complex: {
                                $ne: true
                            }
                        },
                        {
                            out_of_area: {
                                $ne: true
                            }
                        },
                    ]
                }
            }
            console.log(query);
            console.log(routerQuery);
        } else if (this.startDate() && this.endDate())
            query["formDate"] = {
                $gte: moment(this.startDate(), "MM/DD/YYYY").startOf("day").utc().toDate(),
                $lte: moment(this.endDate(), "MM/DD/YYYY").endOf("day").utc().toDate()
            };
        return query;
    },

    updating() {
        if (this.loadingStatus()) {
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
        var csv = "";
        Meteor.call("exportAllVisits", self.query(), "user,patient,agency,insurance,form,formStatus,formDate,timeIn,timeOut,validStatus", function(error, data) {
            csv = Papa.unparse(data);
            tData = "Visits\n"
            var filters = "";
            var query = Router.current().params.query;
            if (query) {
                for (var property in query) {
                    if (query.hasOwnProperty(property)) {
                        filters += "\n" + property + ": " + query[property];
                    }
                }
                filters += "\n";
            }
            // if(self.filterText())
            //   filters+="Filtering by:,"+self.filterText()+"\n";
            tData += filters;
            if (self.startDate() && self.endDate()) {
                tData += "From:," + self.startDate() + ",To," + self.endDate() + "\n";
            }
            tData += csv;
            self.tableData(tData);
        });
    },
    exportAllVisits: function() {
        var self = this;
        Meteor.call("exportAllVisits", self.query(), "user,patient,agency,insurance,form,formStatus,formDate,timeIn,timeOut,validStatus", function(error, data) {
            var csv = Papa.unparse(data);
            tData = "Visits\n"
            var filters = "";
            var query = Router.current().params.query;
            if (query) {
                for (var property in query) {
                    if (query.hasOwnProperty(property)) {
                        filters += "\n" + property + ": " + query[property];
                    }
                }
                filters += "\n";
            }
            // if(self.filterText())
            //   filters+="Filtering by:,"+self.filterText()+"\n";
            tData += filters;
            if (self.startDate() && self.endDate()) {
                tData += "From:," + self.startDate() + ",To," + self.endDate() + "\n";
            }

            tData += csv;
            self._downloadCSV(tData);
        });
    },

    _downloadCSV: function(csv) {
        var blob = new Blob([csv]);
        var a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(blob, {
            type: "text/plain"
        });
        a.download = "Visits.csv";
        if ($("#start-date").val() && $("#end-date").val()) {
            a.download = "Visits (" + $("#start-date").val() + "-" + $("#end-date").val() + ").csv";
        }
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },
    events: {
        'click #sendmail' (event) {
            this.getTableData();
            $('#modal1').openModal();
        },
        "click .download-visits" () {
            console.log("ButtonClicked");
            this.exportAllVisits();
        },
        'click #load' (event) {
            let that = this;
            if (!date_regex.test(this.startDate()) || !date_regex.test(this.endDate())) {
                if (!date_regex.test(this.startDate())) {
                    if (!$("#start-date").hasClass("invalid"))
                        $("#start-date").toggleClass("invalid");
                }
                if (!date_regex.test(this.endDate())) {
                    if (!$("#end-date").hasClass("invalid"))
                        $("#end-date").toggleClass("invalid");
                }
            } else if (this.endDate() < this.startDate()) {
                if (!$("#end-date").hasClass("invalid"))
                    $("#end-date").toggleClass("invalid");
            } else {
                let startDate = moment(this.startDate(), "MM/DD/YYYY").format("MM/DD/YYYY");
                let endDate = moment(this.endDate(), "MM/DD/YYYY").format("MM/DD/YYYY");
                that.loadingStatus(true);
                Meteor.call('visits.update', startDate, endDate, function(err, res) {
                    if (!err) {
                        that.loadingStatus(false);
                    }
                    //==========================================================
                    // Initialize show entries select without materialize
                    setTimeout(function() {
                        $(".dataTables_length label select").toggleClass("browser-default");
                        $(".dataTables_length label select").css("width", "auto");
                        $(".dataTables_length label select").css("display", "inline-block");
                    }, 100);
                    //==========================================================
                });
            }
        },
        "blur #start-date" (event) {
            validateDate("start-date", this.startDate());
            if (moment(this.startDate(), "MM/DD/YYYY").isAfter(moment(this.endDate(), "MM/DD/YYYY"))) {
                console.log("error");
                $("#start-date").addClass("invalid");
                $("#end-date").addClass("invalid");
                $(".date-error").show()
            } else {
                $("#start-date").removeClass("invalid");
                $("#end-date").removeClass("invalid");
                $(".date-error").hide()
            }
        },
        "blur #end-date" (event) {
            validateDate("end-date", this.endDate());
            if (moment(this.startDate(), "MM/DD/YYYY").isAfter(moment(this.endDate(), "MM/DD/YYYY"))) {
                console.log("error");
                $("#end-date").addClass("invalid");
                $("#start-date").addClass("invalid");
                $(".date-error").show()
            } else {
                $("#end-date").removeClass("invalid");
                $("#start-date").removeClass("invalid");
                $(".date-error").hide()
            }
        }
    },
});
