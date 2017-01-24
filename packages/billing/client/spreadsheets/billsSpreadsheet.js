// client side collections for patients spreadsheet aggregates subscribtion
const BillsSpreadsheet = new Mongo.Collection('bills-spreadsheet');
// selector fields
const fields_dict = {
    "$claim_name": "Claim",
    "$payor_name": "Insurance",
    "$patient_name": "Patient"
};
// Today's date
const today = moment().utc().startOf('day')._d;


Template.billsSpreadsheet.viewmodel({
    fromDate: moment().startOf("month").format("MM/DD/YYYY"),
    toDate: moment().format("MM/DD/YYYY"),
    field1: "$payor_name",
    field2: "$claim_name",
    onCreated() {

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
    autorun() {
        Meteor.subscribe('bills-spreadsheet', this.fromDate(), this.toDate(), this.field1(), this.field2());
    },
    billsSpreadsheet() {
        return BillsSpreadsheet.find();
    },
    TotalCount(unit) {
        return BillsSpreadsheet.find().fetch().reduce((prev, curr) => prev + curr[unit], 0);
    },
    today() {
        return moment(today).format("MM/DD/YYYY");
    },
    weekStart() {
        return moment(today).startOf('week').format("MM/DD/YYYY");
    },
    weekEnd() {
        return moment(today).endOf('week').format("MM/DD/YYYY");
    },
    monthStart() {
        return moment(today).startOf('month').format("MM/DD/YYYY");
    },
    monthEnd() {
        return moment(today).endOf('month').format("MM/DD/YYYY");
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

});
