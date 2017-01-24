import Patients from "./patients.js";
import Claims from "./claims.js";
import Payors from "./payors.js";
import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';
Bills = new Mongo.Collection('bills');
SimpleSchema.messages({"patientError":"Empty/Invalid [label]"});
TabularTables.Bills = new Tabular.Table({
  name: "Bills",
  collection: Bills,
  columns: [{
      data: "patient_name",
      title: "Patient"
  },{
      data: "agency_name",
      title: "Agency",
      searchable: false
  }, {
      data: "claim_name",
      title: "Claim",
      searchable: false
  }, {
      data: "claim_start_date",
      title: "Claim Dates",
      render: function(val, type, doc){
        let start = moment(doc.claim_start_date).utc();
        let end = moment(doc.claim_end_date).utc();
        if(doc.claim_name && doc.claim_name.indexOf("HOSPICE") < 0)
         return start.format("L") + "-" + end.format("L");
        else{
         return  end.diff(start, "days") + " Days, " + start.format("0M, YYYY");
        }


      },
      searchable: false
  },
  {
      data: "payor_name",
      title: "Payor",
      searchable: false
   },
   {
       data: "date",
       title: "Date",
       render: function(val, type, doc){
          return moment(val).utc().format("L");
       },
       searchable: false
   },
  {
      data: "amount",
      title: "Amount",
      searchable: false
  }, {
      data: "paymentsAmount",
      title: "Paid Amount",
      searchable: false
  },
  {
      data: "_id",
      tmpl: Meteor.isClient && Template.billsActions,
      searchable: false
  }],
  search: {
    caseInsensitive: true,
    smart: false,
    regex: false,
    onEnterOnly: false,
  },
  extraFields: ["patient_id", "claim_id", "payor_id", "claim_start_date", "claim_end_date", "date"] ,
  order: [[ 5 ,'desc' ]],
  pageLength: 25,
  lengthChange: false,
  autoWidth: true
});

if(Meteor.isServer){

  Meteor.publish("tabular_bills", function(tableName, ids, fields){
    return Bills.find({_id: {$in: ids}}, {fields: fields});
  });
}




Bills.attachSchema(new SimpleSchema({
    date: {
        type: Date
    },
    agency_id: {
      type: String,
      optional: true,
      label: 'Agency',
      autoform: {
        type: "select",
        options: function(){
          var a = Agencies.find().fetch();
          var r = [];
          a.forEach(function(e) {
            r.push( { label: e.name, value: e._id } );
          });
          return r;
        }
      }
    },
    // orion.attribute('hasOne', {
    //   label: 'Agency',
    //   optional: true,
    // }, {
    //     collection: Agencies,
    //     titleField: 'name',
    //     publicationName: 'bill_agency_id',
    // }),
    agency_name: {
        type: String,
        optional: true,
        autoValue: function(){
          var agency = Agencies.findOne(this.field("agency_id").value);
          if(agency)
            return agency.name;
        }
    },
    claim_name: {
        optional:true,
        type: String,
        autoValue: function(){
          var claim = Claims.findOne(this.field("claim_id").value);
          if(claim)
            return claim.name;
        },

    },
    payor_name: {
        optional:true,
        type: String,
        autoValue: function(){
          var payor = Payors.findOne(this.field("payor_id").value);
          if(payor)
            return payor.name;
        },

    },
    amount: {
        type: Number,
        decimal: true,

    },
    patient_mrn: {
      type: String,
      optional:true,
      label: 'Patient MRN',
      autoValue: function(){
        var patient = Patients.findOne({patient: this.field("patient_name").value});
        if(patient && patient.mrn)
          return patient.mrn;
      },
      autoform: {
        type: "select",
        options: function(){
          var a = Patients.find().fetch();
          var r = [];
          a.forEach(function(e) {
            r.push( { label: e.mrn + " - " + e.name, value: e.mrn } );
          });
          return r;
        },
      },
      custom: function(){
        // if(!this.isSet){
        //   return "patientError";
        // }
      }
    },
    patient_id: {
      type: String,
      optional:true,
      label: 'Patient',
      autoValue: function(){
        var patient = Patients.findOne({patient: this.field("patient_name").value});
        if(patient && patient._id)
          return patient._id;
      },
      autoform: {
        type: "select",
        options: function(){
          var a = Patients.find().fetch();
          var r = [];
          a.forEach(function(e) {
            r.push( { label: e.name, value: e._id } );
          });
          return r;
        },
      },
      custom: function(){
        // if(!this.isSet){
        //   return "patientError";
        // }
      }
    },
    // orion.attribute('hasOne', {
    //   optional:true,
    //   label: 'Patient',
    // }, {
    //     collection: Patients,
    //     titleField: 'patient',
    //     publicationName: 'bill_patient_id',
    // }),
    patient_name: {
      type: String,
      label: "Patient",
      optional: false,
      autoValue: function(){
        if(this.field("patient_id").value)
          var patient = Patients.findOne(this.field("patient_id").value);
        if(patient)
          return patient.patient;
      },
      //
      // custom: function(){
      //   if(this.isSet){
      //     console.log(this);
      //     return "fakes";
      //   }
      //   else{
      //     return "patient";
      //   }
      // }
    },
    claim_id: {
      type: String,
      label: 'Claim',
      autoform: {
        type: "select",
        options: function(){
          var a = Claims.find().fetch();
          var r = [];
          a.forEach(function(e) {
            r.push( { label: e.name, value: e._id } );
          });
          return r;
        }
      }
    },
    // orion.attribute('hasOne', {
    //   optional:true,
    //     label: 'Claim'
    // }, {
    //     collection: Claims,
    //     titleField: 'name',
    //     publicationName: 'bill_claim_id',
    // }),

    claim_start_date: {
      optional:true,
      type: Date
    },
    claim_end_date: {
      optional:true,
      type: Date
    },
    payor_id: {
      type: String,
      label: 'Payor',
      autoform: {
        type: "select",
        options: function(){
          var a = Payors.find().fetch();
          var r = [];
          a.forEach(function(e) {
            r.push( { label: e.name, value: e._id } );
          });
          return r;
        }
      }
    },
    // orion.attribute('hasOne', {
    //   optional:true,
    //     label: 'Payor'
    // }, {
    //     collection: Payors,
    //     titleField: 'name',
    //     publicationName: 'bill_payor_id',
    // }),
    paid: {
        type: Boolean,
        optional: true,
        autoValue: function(doc) {
            if (this.isInsert) {
                return doc.amount <= 0;
            }
        },
        autoform: {
            type: "hidden",
            label: false
        },
    },
    paymentsAmount: {
      optional:true,
        type: Number,
        defaultValue: 0,
        decimal: true,
        autoform: {
            type: "hidden",
            label: false
        },
    },
    LastPaymentsDate: {
        optional:true,
        type: Date,
        autoform: {
            type: "hidden",
            label: false
        },
        autoValue: function(doc) {
            if (this.isInsert) {
                return doc.date;
            }
        }
    },
    followUp: {
        type: Date,
        optional:true
    },
    note:{
      type: String,
      optional: true
    },
    r_id: {
        optional: true,
        type: Number
    }
}));

Bills.helpers({
    patient() {
        var patient = Patients.findOne(this.patient_id);
        if (patient)
            return patient;
        else
            return {};
    },
    patientAgency() {

      var patient = Patients.findOne(this.patient_id);
      if(patient)
        return patient.agency_id;
      else
        return "-";
        // var patie;nt = Patients.findOne(this.patient_id);
        // if (patient) {
        //     if (patient.agency_id)
        //         return Agencies.findOne(patient.agency_id).name;
        // } else
        //     return {};
    },
    claim() {
        var claim = Claims.findOne(this.claim_id);
        if (claim)
            return claim;
        else
            return {};
    },
    payor() {
        var payor = Payors.findOne(this.payor_id);
        if (payor)
            return payor;
        else
            return {};
    },
    payments() {
        return Payments.find({
            bill_id: this._id
        });
    },

    claimsDates() {
        return moment(this.claim_start_date).format("L") + ' - ' + moment(this.claim_end_date).format("L")
    },
    billDate: function() {
        return moment(this.date).format("ll");
    }
});

if (Meteor.isServer) {
    function doRecievablesAggregation(filterType, fromDate, toDate, paymentState) {
        var firstModel, secondModel;
        var firstTypeID, secondTypeID;
        if (filterType == "claim") {
            firstModel = Claims;
            firstTypeID = "claim_id";
            secondModel = Payors;
            secondTypeID = "payor_id"
        } else {
            firstModel = Payors;
            firstTypeID = "payor_id";
            secondModel = Claims;
            secondTypeID = "claim_id"
        }
        var dateMatch = {};
        if (fromDate) {
            dateMatch["$gte"] = new Date(fromDate);
        }
        if (toDate) {
            dateMatch["$lte"] = new Date(toDate);
        }

        var firstData = firstModel.find({}, {sort: { priority: -1 }}).map(function(o) {
            return o;
        });
        var secondData = secondModel.find({}, {sort: { priority: -1 }}).map(function(o) {
            return o;
        });
        var aggr;
        var data = {};
        var match = {};
        var group = [
                      {"$group":{
                          "_id": {
                              "claim_id": "$claim_id",
                              "payor_id": "$payor_id",
                          },
                          "total": {$sum: "$amount"},
                          "paidTotal": {
                              $sum: "$paymentsAmount"
                          },
                          "count": {$sum: 1}
                      }}
                    ];
        if (Object.keys(dateMatch).length > 0) {
            match.date = dateMatch;
        }
        if (paymentState == "no_payment") {
            match.paymentsAmount = 0;
        } else {
            match.paymentsAmount = {
                $ne: 0
            };
        }
        if(Object.keys(match).length > 0){
            group.unshift({"$match": match})
        }
        aggr = Bills.aggregate(group);
        var firstData = firstModel.find({}, {sort: { priority: -1 }}).map(function(o) {
            return o;
        });
        var firstHash = {};
        firstModel.find({}, {sort: { priority: -1 }}).map(function(o) {
            firstHash[o._id] = o;
        });

        var secondHash = {};
        secondModel.find({}, {sort: { priority: -1 }}).map(function(o) {
            secondHash[o._id] = o;
        });
        for (var i = 0, firstName, secondType; i < aggr.length; i++) {
          // THERE IS AN ISSUE HERE NEEDS TO BE FIXED
          // console.log(firstHash[aggr[i]._id[firstTypeID]]);
          if(firstHash[aggr[i]._id[firstTypeID]] && secondHash[aggr[i]._id[secondTypeID]]){
            firstName = firstHash[aggr[i]._id[firstTypeID]].name;
            data[firstName] = data[firstName] || {};
            data[firstName].name = firstName;
            data[firstName].type = firstTypeID.substring(0, firstTypeID.length - 3);
            data[firstName].second = data[firstName].second || {};
            secondType = secondHash[aggr[i]._id[secondTypeID]];
            data[firstName].second[secondType.name] = data[firstName].second[secondType.name] || {};
            data[firstName].second[secondType.name].total = aggr[i].total;
            data[firstName].second[secondType.name].paidTotal = aggr[i].paidTotal;
            data[firstName].second[secondType.name].count = aggr[i].count;
          }
        };
        for (var first in data) {
            data[first].total = 0;
            data[first].paidTotal = 0;
            data[first].count = 0;
            Object.keys(data[first].second).map(function(key) {
                data[first].total += data[first].second[key].total;
                data[first].paidTotal += data[first].second[key].paidTotal;
                data[first].count += data[first].second[key].count;
            });
        }
        return data;
    }

    Meteor.methods({
        recievablesAggregation: function(filterType, fromDate, toDate, paymentState, TIME_LINE) {
            var datum = {};
            var startDate = moment(fromDate || moment(0), "MM/DD/YYYY").startOf("day").utc().toDate();
            var endDate = moment(toDate || moment(), "MM/DD/YYYY").endOf("day").utc().toDate();

            var f = startDate,
                t = endDate;
            datum.total = doRecievablesAggregation(filterType, fromDate, toDate, paymentState);
            for (time in TIME_LINE) {
                t = moment(endDate);
                t.date(t.date() - TIME_LINE[time]["to"]);
                if (TIME_LINE[time].hasOwnProperty("from")) {
                    f = moment(endDate);
                    f.date(f.date() - TIME_LINE[time]["from"]);
                    datum[time] = doRecievablesAggregation(filterType, f.format("YYYY-M-D"), t.format("YYYY-M-D"), paymentState);
                } else {
                    datum[time] = doRecievablesAggregation(filterType, "", t.format("YYYY-M-D"), paymentState);
                }
                if (f.isBefore(startDate)) break;
            }
            return datum;
        },
        billsSummaryAggregation: function(filterType, fromDate, toDate) {
            var model = {
                total: 0,
                count: 0,
                name: "",
                type: ""
            };

            var firstModel, secondModel;
            var firstTypeID, secondTypeID;
            if (filterType == "claim") {
                firstModel = Claims;
                firstTypeID = "claim_id";
                secondModel = Payors;
                secondTypeID = "payor_id";
            } else {
                firstModel = Payors;
                firstTypeID = "payor_id";
                secondModel = Claims;
                secondTypeID = "claim_id"
            }

            var dateMatch = {};
            if (fromDate) {
                dateMatch["$gte"] = new moment(fromDate, "MM/DD/YYYY").startOf("day").utc().toDate();
            }
            if (toDate) {
                dateMatch["$lte"] = new moment(toDate, "MM/DD/YYYY").endOf("day").utc().toDate();
            }

            var firstData = firstModel.find({}, {sort: { priority: -1 }}).map(function(o) {
                return o;
            });
            var firstHash = {};
            firstModel.find({}, {sort: { priority: -1 }}).map(function(o) {
                firstHash[o._id] = o;
            });

            var secondHash = {};
            secondModel.find({}, {sort: { priority: -1 }}).map(function(o) {
                secondHash[o._id] = o;
            });

            var aggr;
            var group = [
                            {"$group":{
                                "_id": {
                                    "claim_id": "$claim_id",
                                    "payor_id": "$payor_id",
                                },
                                "total": {$sum: "$amount"},
                                "count": {$sum: 1}
                            }}
                        ];
            if (Object.keys(dateMatch).length > 0) {
                group.unshift({"$match": {"date": dateMatch}})
            }
            aggr = Bills.aggregate(group);
            var data = {};
            var match;
            for (var i = 0, firstName, secondType; i < aggr.length; i++) {
              // THERE IS AN ISSUE HERE NEEDS TO BE FIXED
              if(firstHash[aggr[i]._id[firstTypeID]] && secondHash[aggr[i]._id[secondTypeID]]){
                firstName = firstHash[aggr[i]._id[firstTypeID]].name;
                data[firstName] = data[firstName] || Object.assign({}, model);
                data[firstName].name = firstName;
                data[firstName].type = firstTypeID.substring(0, firstTypeID.length - 3);
                data[firstName].second = data[firstName].second || [];
                data[firstName].second.push(Object.assign({}, model))
                secondType = secondHash[aggr[i]._id[secondTypeID]];
                data[firstName].second[data[firstName].second.length - 1].name = secondType.name;
                data[firstName].second[data[firstName].second.length - 1].priority = secondType.priority;
                data[firstName].second[data[firstName].second.length - 1].type = secondTypeID.substring(0, secondTypeID.length - 3);
                data[firstName].second[data[firstName].second.length - 1].total = aggr[i].total;
                data[firstName].second[data[firstName].second.length - 1].count = aggr[i].count;
              }
            };
            var sortedData = {};
            function compare (a,b) {
                if (a.priority < b.priority)
                    return 1;
                if (a.priority > b.priority)
                    return -1;
                return 0;
            }
            for (var i = 0; i < firstData.length; i++) {
                if(data.hasOwnProperty(firstData[i].name)){
                    sortedData[firstData[i].name] = data[firstData[i].name];
                    sortedData[firstData[i].name].second.sort(compare);
                }
            };
            data = sortedData;

            var total = 0;
            var count = 0;

            for (var first in data) {
                data[first].second.map(function(elm) {
                    data[first].total += accounting.unformat(elm.total);
                    data[first].count += elm.count;
                });
                total += data[first].total;
                data[first].total = accounting.formatMoney(data[first].total);
                count += data[first].count;
            }
            return {
                data: data,
                total: total,
                count: count
            };
        }

    });
}
Meteor.methods({
    exportAllBills: function(selector, fields) {
        // console.log(selector);
        var data = [];
        var collectionItems = Bills.find(selector).fetch();
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

if (Meteor.isServer) {
    Meteor.publish("bills", function(){
      return Bills.find({});
    });
}

if (Meteor.isServer) {
    parseDate=function(dt){
      return moment(dt).format("ll");
    };
    Bills.before.insert(function (userId, doc) {
      var bill = Bills.findOne({date:doc.date, patient_name: doc.patient_name, claim_id:doc.claim_id, claim_start_date:doc.claim_start_date, claim_end_date:doc.claim_end_date})
      if (bill) {
        return false;
      }
      var pat = Patients.findOne(doc.patient_id);
      if(pat){
        if(pat.agencyId){
          var agency = Agencies.findOne({rid: pat.agencyId});
          if(agency){
            doc.agency_id = agency._id
            doc.agency_name = agency.name
          }
        }
      }
    });
    // update paid flag depending on 'amount' and 'paymentsAmount' values
    Bills.before.update(function (userId, doc, fieldNames, modifier) {
        if(modifier.$set.hasOwnProperty("amount") || modifier.$set.hasOwnProperty("paymentsAmount")) {
            let amount = modifier.$set.amount || doc.amount;
            let paymentsAmount = modifier.$set.paymentsAmount || doc.paymentsAmount;
            modifier.$set.paid = amount <= paymentsAmount;
        }
    });

    Bills.after.insert(function(userId, doc, fieldNames, modifier) {
      //  console.log("bill inserted!", doc._id);
        let description = [];
        if (doc.patient_id) {
            description.push("Set \"Patient\" to " + Patients.findOne(doc.patient_id).patient);
        }
        if (doc.claim_id) {
            description.push("Set \"Claim\" to " + Claims.findOne(doc.claim_id).name);
        }
        if (doc.claim_start_date) {
            description.push("Set \"Claim Start Date\" to " + parseDate(doc.claim_start_date));
        }
        if (doc.claim_end_date) {
            description.push("Set \"Claim End Date\" to " + parseDate(doc.claim_end_date));
        }
        if (doc.payor_id) {
            description.push("Set \"Payor\" to " + Payors.findOne(doc.payor_id).name);
        }
        if (doc.billDate) {
            description.push("Set \"Bill Date\" to " + parseDate(doc.billDate));
        }
        if (doc.amount) {
            description.push("Set \"Amount\" to " + doc.amount);
        }
        if (doc.paymentsAmount) {
            description.push("Set \"Payments Amount\" to " + doc.paymentsAmount);
        }
        if (doc.paid) {
            description.push("Set \"Paid\" to " + doc.paid);
        }
        if (doc.followUp) {
            description.push("Set \"Follow Up\" to " + parseDate(doc.followUp));
        }
        if (doc.note) {
            description.push("Set \"Note\" to " + doc.note);
        }

        if(userId){
          Audits.insert({
              "user": userId,
              "date": new Date(),
              "type": "create",
              "description": description,
              "entityTable": "Bills",
              "entityId": doc._id

          });
      }
    });
    Bills.after.update(function(userId, doc, fieldNames, modifier) {
        var previous = this.previous;
        let description = [];
        if (doc.patient_id !== previous.patient_id) {
            description.push("Changed \"Patient\" from " + Patients.findOne(previous.patient_id).patient + " to " + Patients.findOne(doc.patient_id).patient);
        }
        if (doc.claim_id !== previous.claim_id) {
            description.push("Changed \"Claim\" from " + Claims.findOne(previous.claim_id).name + " to " + Claims.findOne(doc.claim_id).name);
        }
        if (doc.claim_start_date + "" !== previous.claim_start_date + "") {
            description.push("Changed \"Claim Start Date\" from " + parseDate(previous.claim_start_date) + " to " + parseDate(doc.claim_start_date));
        }
        if (doc.claim_end_date + "" !== previous.claim_end_date + "") {
            description.push("Changed \"Claim End Date\" from " + parseDate(previous.claim_end_date) + " to " + parseDate(doc.claim_end_date));
        }
        if (doc.payor_id !== previous.payor_id) {
            description.push("Changed \"Payor\" from " + Payors.findOne(previous.payor_id).name + " to " + Payors.findOne(doc.payor_id).name);
        }
        if (doc.billDate + "" !== previous.billDate + "") {
            description.push("Changed \"Bill Date\" from " + parseDate(previous.billDate) + " to " + parseDate(doc.billDate));
        }
        if (doc.amount !== previous.amount) {
            description.push("Changed \"Amount\" from " + previous.amount + " to " + doc.amount);
        }
        if (doc.paymentsAmount !== previous.paymentsAmount) {
            description.push("Changed \"Payments Amount\" from " + previous.paymentsAmount + " to " + doc.paymentsAmount);
        }
        if (doc.paid !== previous.paid) {
            if (!previous.paid) {
                description.push("Changed \"Paid\" from " + "false" + " to " + doc.paid);
            } else {
                description.push("Changed \"Paid\" from " + previous.paid + " to " + doc.paid);
            }
        }
        if (doc.followUp !== previous.followUp) {
            description.push("Changed \"Follow Up\" from " + parseDate(previous.followUp) + " to " + parseDate(doc.followUp));
        }
        if (doc.note !== previous.note) {
            description.push("Changed \"Note\" to " + doc.note);
        }
        if(userId){
          Audits.insert({
              "user": userId,
              "date": new Date(),
              "type": "update",
              "description": description,
              "entityTable": "Bills",
              "entityId": doc._id

          });
        }
        // console.log(fieldNames);
        // console.log(description);
    });
    Bills.after.remove(function (userId, doc) {
      let description = [];
      console.log(doc);
      var name = "Unknown User";
      var user = Meteor.users.findOne({_id:userId});
      if(user)
        name = user.profile.name;
      description.push("Date: "+doc.date);
      description.push("Patient: "+doc.patient_name);
      description.push("Claim: "+doc.claim_name);
      description.push("Payor: "+doc.payor_name);
      description.push("Amount: "+doc.amount);
      description.push("Paid amount: "+doc.paymentsAmount);
      if(userId){
        Audits.insert({
            "user": userId,
            "date": new Date(),
            "type": "delete",
            "description": description,
            "entityTable": "Bills",
            "entityId": doc._id
        });
      }
    });
}

export default Bills;
