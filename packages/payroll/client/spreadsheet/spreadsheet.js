// client side collections for patients spreadsheet aggregates subscribtion
const VisitsSpreadsheet = new Mongo.Collection('visits-spreadsheet');
// selector fields
const fields_dict = {
    "patient": "Patient",
    "user": "User",
    "form": "Type",
    "billingState": "Timesheet Status",
    "formStatus": "Form State"
};

Template.visitsSpreadsheet.viewmodel({
    headerVariable: {
        title: "Visits Spreadsheet",
        subtitle: "Visits Spreadsheet",
        hasBack: false
    },
    fromDate: moment().startOf("month").format("MM/DD/YYYY"),
    toDate: moment().format("MM/DD/YYYY"),
    field1: "user",
    field2: "form",
    onCreated() {


    },
    autorun() {
        console.log(this.fromDate, this.toDate(), this.field1(), this.field2());
        Meteor.subscribe('visits-spreadsheet', this.fromDate(), this.toDate(), this.field1(), this.field2());
    },
    onRendered() {
        var fromDate = new Pikaday({
            field: $('#from')[0],
            format: "MM/DD/YYYY"
        });
        var toDate = new Pikaday({
            field: $('#to')[0],
            format: "MM/DD/YYYY"
        });

    },
    visitsSpreadsheet() {
        return VisitsSpreadsheet.find();
    },
    TotalCount(unit) {
        return VisitsSpreadsheet.find().fetch().reduce((prev, curr) => prev + curr[unit], 0);
    },

    selector1() {
        let select = Object.keys(fields_dict);
        return select.map(e => {
            let option = {
                value: e,
                innerHTML: fields_dict[e]
            };
            if (e == this.field1()) {
                option.selected = 'selected';
            }
            return option;
        });
    },
    selector2() {
        let select = Object.keys(fields_dict);
        return select.map(e => {
            let option = {
                value: e,
                innerHTML: fields_dict[e]
            };
            if (e == this.field2()) {
                option.selected = 'selected';
            }
            return option;
        });
    },
    tableData: function() {
        if (!this.visitsSpreadsheet())
            return;

        var rows = "";

        rows += "Visits Spreadsheet\n"

        var tableHead = $("#change-field1 option:selected").text() + ',' + $("#change-field2 option:selected").text() + ',' + 'Today,Week,Month\n';
        rows += tableHead;
        //
        var getColData = function(rowVar) {
            rows += rowVar.days + ",";
            rows += rowVar.weeks + ",";
            rows += rowVar.months + "\n";
        };
        //
        // // OTHER ROWS
        _.each(this.visitsSpreadsheet().fetch(), function(totalAggregate) {
            rows += totalAggregate._id + ", ,";
            getColData(totalAggregate);

            _.each(totalAggregate.field2Aggregates, function(secAggregate) {
                rows += " ," + secAggregate._id + ",";
                getColData(secAggregate);
            });
        });
        // //LAST ROW
        rows += "Total, ,";
        rows += this.TotalCount("days");
        rows += this.TotalCount("weeks");
        rows += this.TotalCount("months");

        // getColData(lastRow);
        return rows;
    },
    downloadCSV: function() {
        // var data, filename, link;
        var csv = this.tableData();
        if (csv == null) return;
        filename = 'Visits-Spreadsheet.csv';
        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }

        data = encodeURI(csv);
        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    },
});

Template.visitsSpreadsheet.events({

    'click #sendmail' (event) {
        $('#modal1').openModal();
    },
});
