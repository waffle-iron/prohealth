var showToday;
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
Template.reportsPaymentsSummary.viewmodel({
    headerVariable: {
        title: "Payments Summary",
        subtitle: "Grouped and filtered by payment date",
        hasBack: false
    },
    fromDate: '',
    toDate: '',
    filterType: 'payment_type',
    showTodayVar: 'show',
    aggrData: '',
    isLoading: true,

    onCreated: function() {
        if (Session.get("billsFromDate")) {
            this.fromDate(Session.get("billsFromDate"));
        } else {
            this.fromDate(moment().utc().startOf('week').format("MM/DD/YYYY"));
        }

        this.toDate(moment().utc().format("MM/DD/YYYY"));

        //--
        if (Session.get("paymentsFilterType")) {
            this.filterType(Session.get("paymentsFilterType"));
        }
        //--
        if (Session.get("showToday")) {
            this.showTodayVar(Session.get("showToday"));
        }
    },
    autorun: function() {
        if (this.fromDate()) {
            console.log(this.fromDate());
            Session.set("billsFromDate", this.fromDate());
        }
        // if(Session.get("billsFromDate")){
        //   this.fromDate(Session.get("billsFromDate"));
        // }
        //--
        if (this.toDate()) {
            Session.set("billsToDate", this.toDate());
        }
        // if(Session.get("billsToDate")){
        //   this.toDate(Session.get("billsToDate"));
        // }


        //--
        var that = this;
        this.isLoading(true);
        Meteor.call("paymentsAggregation", this.filterType(), this.fromDate(), this.toDate(), this.showTodayVar(), function(err, res) {
            that.aggrData(res);
            Meteor.setTimeout(function() {
                $('.collapsible').collapsible({
                    accordion: false
                });
            }, 1000);
            that.isLoading(false);
        });
    },
    datesParams: function() {
        var dates = "";
        if (this.fromDate()) {
            dates += "&from=" + this.fromDate();
        }
        if (this.toDate()) {
            dates += "&to=" + this.toDate();
        }
        return dates;
    },
    total: function() {
        if (this.aggrData())
            return accounting.formatMoney(this.aggrData().total);
        return accounting.formatMoney(0);
    },
    count: function() {
        if (this.aggrData())
            return this.aggrData().count;
        return 0;
    },
    fullTodayTotal: function() {
        if (this.aggrData())
            return accounting.formatMoney(this.aggrData().todayTotal);
        return accounting.formatMoney(0);
    },
    fullTodayCount: function() {
        if (this.aggrData())
            return this.aggrData().todayCount;
        return 0;
    },
    datumFirstLevel: function() {
        if (!this.aggrData())
            return;
        var datum = [];
        for (first in this.aggrData().data)
            datum.push(this.aggrData().data[first]);
        return datum;
    },
    datumSecondLevel: function(first) {
        if (!this.aggrData())
            return;
        if (this.aggrData() && this.aggrData().data.hasOwnProperty(first))
            return this.aggrData().data[first].second;
        return [{}];
    },
    showToday: function() {
        return this.showTodayVar() == "show";
    },
    onRendered: function() {
        $("select").material_select();
        Materialize.updateTextFields();
        var fromDate = new Pikaday({
            field: $('#from')[0],
            format: "MM/DD/YYYY"
        });
        var toDate = new Pikaday({
            field: $('#to')[0],
            format: "MM/DD/YYYY"
        });
        if (moment(this.fromDate(), "MM/DD/YYYY").isAfter(moment(this.toDate(), "MM/DD/YYYY"))) {
            console.log("error");
            $("#from").addClass("invalid");
            $("#to").addClass("invalid");
            $(".date-error").show()
        } else {
            $("#from").removeClass("invalid");
            $("#to").removeClass("invalid");
            $(".date-error").hide()
        }
    },
    invalidDates: function() {
        return !moment(this.fromDate(), "MM/DD/YYYY").isValid() || !moment(this.toDate(), "MM/DD/YYYY").isValid()
    },
    getType(type) {
        return type.replace("&", "%26")
    },
    downloadCSV: function() {
        var data, filename, link;
        var csv = this.convertArrayOfObjectsToCSV();
        if (csv == null) return;
        filename = 'Payments-Summary.csv';
        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    },
    convertArrayOfObjectsToCSV: function() {
        var result = "";
        var data = this.datumFirstLevel();
        if (data == null || !data.length) {
            return null;
        }
        var line = '';
        line += 'Payments Summary, From, To, Group By\n';
        result += line;
        line = '';
        line += ',' + this.fromDate() + ',' + this.toDate() + ',' + this.filterType() + '\n';
        result += line;
        result += ' , , , \n';
        result += ' , ' + (this.showToday() ? ",Count (Today),Amount (Today)" : "") + ',Count (Total), Amount (Total)\n';
        for (first in data) {
            line = '';
            line += data[first].name + ', ,' + (this.showToday() ? data[first].todayCount + ',' + '$' + accounting.unformat(data[first].todayTotal) + ',' : "") + data[first].count + ',' + '$' + accounting.unformat(data[first].total) + '\n';
            result += line;
            for (var i = 0; i < data[first].second.length; i++) {
                line = '';
                line += ' ,' + data[first].second[i].name + ',' + (this.showToday() ? data[first].second[i].todayCount + ',' + '$' + accounting.unformat(data[first].second[i].todayTotal) + ',' : "") + data[first].second[i].count + ',' + '$' + accounting.unformat(data[first].second[i].total) + '\n';
                result += line;
            }
        }
        line = '';
        line += 'Total, , ' + (this.showToday() ? this.aggrData().todayCount + ',' + '$' + accounting.unformat(this.aggrData().todayTotal) + ',' : "") + this.aggrData().count + ',' + '$' + accounting.unformat(this.aggrData().total) + '\n';
        result += line;

        return result;

    },
    events: {
        'click #sendmail' (event) {
            $('#modal1').openModal();
        },
        "blur #from" (event) {
            validateDate("from", this.fromDate());
            if (moment(this.fromDate(), "MM/DD/YYYY").isAfter(moment(this.toDate(), "MM/DD/YYYY"))) {
                console.log("error");
                $("#from").addClass("invalid");
                $("#to").addClass("invalid");
                $(".date-error").show()
            } else {
                $("#from").removeClass("invalid");
                $("#to").removeClass("invalid");
                $(".date-error").hide()
            }
        },
        "blur #to" (event) {
            validateDate("to", this.toDate());
            if (moment(this.fromDate(), "MM/DD/YYYY").isAfter(moment(this.toDate(), "MM/DD/YYYY"))) {
                console.log("error");
                $("#from").addClass("invalid");
                $("#to").addClass("invalid");
                $(".date-error").show()
            } else {
                $("#from").removeClass("invalid");
                $("#to").removeClass("invalid");
                $(".date-error").hide()
            }
        }
    }
});

Template.dataFirstLevel.viewmodel({
    showToday: function() {
        return ViewModel.findOne("reportsPaymentsSummary").showToday();
    }
});

Template.dataSecondLevel.viewmodel({
    showToday: function() {
        return ViewModel.findOne("reportsPaymentsSummary").showToday();
    }
});
