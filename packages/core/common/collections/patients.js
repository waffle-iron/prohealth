import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';

Patients = new Mongo.Collection('patients');

TabularTables.Patients = new Tabular.Table({
  name: "Patients",
  collection: Patients,
  columns: [
    { data: "mrn", title: "MR#" },
    { data: "patient", title: "Patient" },
    { data: "chartStatus", title: "Chart Status" },
    { data: "agency", title: "Agency" },
    { data: "primaryInsurance", title: "Primary Insurance" },
    { data: "marketer", title: "Marketer" },
    { data: "insuranceType", title: "Insurance Type"},
    { data: "businessType", title: "Business"},
    {
      data: "referalDate",
      title: "Referal Date",
      render: function (val, type, doc) {
        return val ? moment(val).format("MM/DD/YYYY") : '';
      }
    },
  ],
  search: {
    caseInsensitive: true,
    smart: true,
    onEnterOnly: true,
  },
});

Patients.schema = new SimpleSchema({
    activityId:         { type: Number, label: "Activity ID", optional: true },
    patientDeveroId:    { type: Number, label: "Patient Devero ID", optional: true },
    patient:            { type: String, label: "Patient" },
    chartStatus:        { type: String, label: "Chart Status", optional: true },
    agencyId:           { type: String, label: "Agency ID", optional: true},
    agency:             { type: String, label: "Agency", optional: true },
    marketer:           { type: String, label: "Marketer", optional: true },
    primaryInsurance:   { type: String, label: "Primary Insurance", optional: true },
    secondaryInsurance: { type: String, label: "Secondary Insurance", optional: true },
    referalDate:        { type: Date,   label: "Referal Date", optional: true },
    socDate:            { type: Date,   label: "SOC Date", optional: true },
    chartStatus:        { type: String, label: "Status", optional: true},
    mrn:                { type: String, label: "Medical Record Number", optional: true},
    insuranceType:      { type: String, label: "Insurance Type", optional: true},
    businessType:       { type: String, label: "Business", optional: true}
  });

Patients.helpers({
  agency_name(){
    return this.agencyId;
  },
});

function patientsAggregateImpl(groupBy, fromDate, toDate){
    var match = {
        "$match": {
            referral_date: {
                $gte: fromDate,
                $lte: toDate
            }
        }
    };
    var group = { $group: { _id: "$" + groupBy, count: { $sum: 1 } } };
    var pipeline = [match, group];
    return Patients.aggregate(pipeline);
}

if(Meteor.isServer){
  Meteor.publish("allPatients", function(){
    return Patients.find();
  });
}

Meteor.methods({
  getPatientLimited: function (regex, limit) {
    var regexx = new RegExp( '.*'+regex+'.*', 'i' );
    return Patients.find({patient: {$regex: regexx, $options:'i' }}, {limit: limit}).map(function(o){return o;});
  },

  "patientsAggregate": function(groupBy, fromDate) {
      var day = patientsAggregateImpl(groupBy, moment(fromDate).startOf("day").toDate(), moment(fromDate).endOf("day").toDate());
      var week = patientsAggregateImpl(groupBy, moment(fromDate).startOf("week").toDate(), moment(fromDate).endOf("day").toDate());
      var month = patientsAggregateImpl(groupBy, moment(fromDate).startOf("month").toDate(), moment(fromDate).endOf("day").toDate());

      return { day: day, week: week, month: month };
  },
  exportAllPatients: function(selector, fields) {
      // console.log(selector);
      var data = [];
      var collectionItems = Patients.find(selector).fetch();
      // console.log(collectionItems);
      var arr = fields.split(",");
      _.each(collectionItems, function(item) {
          var row = [];
          for (i = 0; i < arr.length; i++) {
            row.push(item[arr[i]]);
          }
          data.push(row);
      });
      return { fields: fields.split(","), data: data };
  }
});
export default Patients;
