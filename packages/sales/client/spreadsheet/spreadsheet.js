import './spreadsheet.html';

// client side collections for patients spreadsheet aggregates subscribtion
const PatientsSpreadsheet = new Mongo.Collection('patients-spreadsheet');
// selector fields
const fields_dict = {
    "$insuranceType": "Public/Private",
    "$marketer": "Marketer",
    "$agency": "Agency",
    "$primaryInsurance": "Insurance"
};
// Today's date

Template.patientsSpreadsheet.viewmodel({
    headerVariable: function() {
        return {
            title: Router.current().params.query.type + " Sales Report",
            subtitle: "Grouped by marketer, insurance & agency",
            hasBack: false
        }
    },
    filtersArr: [{
        name: "Date",
        id: "date"
    }],
    field1: "$primaryInsurance",
    field2: "$marketer",
    date: moment(new Date()).utc().format("MM/DD/YYYY"),
    paid: "all",
    subReady: false,
    onCreated() {

    },
    autorun() {
        this.subReady(false);
        let insurances = null;
        if (this.paid() == "paid") {
            insurances = ["Medicare Home Health", "Hospice Medicare"];
        }
        let that = this;
        Meteor.subscribe(
            'patients-spreadsheet',
            Router.current().params.query["type"] || "Hospice",
            this.date(),
            this.field1(),
            this.field2(),
            insurances, {
                onReady() {
                    that.subReady(true);
                }
            }

        );
    },
    onRendered() {
        var date = new Pikaday({
            field: $('#date')[0],
            format: "MM/DD/YYYY"
        });
    },
    field1s() {
        return this.field1().substr(1);
    },
    field2s() {
        return this.field2().substr(1);
    },
    patientsSpreadsheet() {


        return PatientsSpreadsheet.find().fetch().sort(function(a, b) {
            return b.monthReferrals - a.monthReferrals
        });
    },
    getStatus() {
        if (this.patientsSpreadsheet()) {
            return true;
        } else {
            return false;
        }
    },
    TotalCount(unit) {
        return PatientsSpreadsheet.find().fetch().reduce((prev, curr) => prev + curr[unit], 0);
    },
    type() {
        return Router.current().params.query["type"] || "Hospice";
    },
    sameField() {
        return this.field1() == this.field2();
    },
    today() {
        return this.date();
    },
    weekStart() {
        return moment(this.date(), "MM/DD/YYYY").utc().startOf('week').format("MM/DD/YYYY");
    },
    weekEnd() {
        return moment(this.date(), "MM/DD/YYYY").utc().endOf('week').format("MM/DD/YYYY");
    },
    monthStart() {
        return moment(this.date(), "MM/DD/YYYY").utc().startOf('month').format("MM/DD/YYYY");
    },
    monthEnd() {
        return moment(this.date(), "MM/DD/YYYY").utc().endOf('month').format("MM/DD/YYYY");
    },

    selector1() {
        let that = this;
        let select = Object.keys(fields_dict);
        // select.splice(select.indexOf(that.field2()),1);
        return select.map(e => {

            let option = {
                value: e,
                innerHTML: fields_dict[e]
            };

            if (e == that.field1()) {
                option.selected = 'selected';
            }
            return option;
        });
    },
    selector2() {
        let that = this;
        let select = Object.keys(fields_dict);
        //select.splice(select.indexOf(that.field1()),1);
        return select.map(e => {
            let option = {
                value: e,
                innerHTML: fields_dict[e]
            };
            if (e == that.field2()) {
                option.selected = 'selected';
            }
            return option;
        });
    },
    // Download csv
    tableData: function() {
        if (!this.patientsSpreadsheet())
            return;
        //console.log(this.patientsSpreadsheet());
        var rows = "";

        rows += this.type() + " Sales Report\n"
        rows += "Selected Date:," + this.date() + "\n"
        rows += "\n"

        var getColData = function(rowVar) {
            rows += rowVar.dayLeads + ",";
            rows += rowVar.dayReferrals + ",";
            rows += rowVar.weekLeads + ",";
            rows += rowVar.weekReferrals + ",";
            rows += rowVar.monthLeads + ",";
            rows += rowVar.monthReferrals + ",";
            rows += rowVar.monthNonAdmit + ",";
            rows += rowVar.monthAdmitted + "\n";
        };
        var tableHead1 = "First Group,Second Group,Date,,Date Week,,Date Month,,,\n";
        var tableHead2 = this.field1s() + ',' + this.field2s() + ',Leads,Referrals,Leads,Referrals,Leads,Referrals,Non-Admit,Admit\n';
        //
        rows += tableHead1;
        rows += tableHead2;
        // // OTHER ROWS
        var different = this.field2s() != this.field2s();
        _.each(this.patientsSpreadsheet(), function(totalAggregate) {
            rows += totalAggregate._id + ", ,";
            getColData(totalAggregate);
            if (different) {
                _.each(totalAggregate.field2Aggregates, function(secAggregate) {
                    if (secAggregate._id.includes(",")) {
                        rows += " ," + secAggregate._id.replace(",", "") + ",";
                    } else
                        rows += " ," + secAggregate._id + ",";
                    getColData(secAggregate);
                });
            }
        });
        //LAST ROW
        var lastRow = this.patientsSpreadsheet();
        rows += "Total, ,";
        rows += this.TotalCount("dayLeads") + ",";
        rows += this.TotalCount("dayReferrals") + ",";
        rows += this.TotalCount("weekLeads") + ",";
        rows += this.TotalCount("weekReferrals") + ",";
        rows += this.TotalCount("monthLeads") + ",";
        rows += this.TotalCount("monthReferrals") + ",";
        rows += this.TotalCount("monthNonAdmit") + ",";
        rows += this.TotalCount("monthAdmitted") + "\n";
        return rows;
    },
    downloadCSV: function() {
        // var data, filename, link;
        var csv = this.tableData();
        if (csv == null) return;
        filename = this.type() + '-Sales-report.csv';
        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }

        data = encodeURI(csv);
        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    },
    events: {
        'click #update-date button' (event, instance) {
            Meteor.call('patients.update', moment(this.date(), "MM/DD/YYYY").startOf("month").format("MM/DD/YYYY"), moment(this.date(), "MM/DD/YYYY").endOf("month").format("MM/DD/YYYY"), 10000);
        },
        'change #date' (event, instance) {
            this.date(event.target.value);
        },
        'change #paid' (event, instance) {
            this.paid(event.target.value);
        },

        'click #sendmail' (event) {
            $('#modal1').openModal();
        },
    }
})
