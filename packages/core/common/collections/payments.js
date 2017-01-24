import PaymentTypes from "./payment_types.js";
import Bills from "./bills.js";
import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';
Payments = new Mongo.Collection('payments');
TabularTables.Payments = new Tabular.Table({
  name: "Payments",
  collection: Payments,
  columns: [{
      data: "patient()",
      title: "Patient"
  }, {
      data: "claim()",
      title: "Claim Type"
  },{
      data: "type()",
      title: "Payment Type"
  }, {
      data: "payor()",
      title: "Payor"
  }, {
      data: "billAmount()",
      title: "Bill Amount"
  }, {
      data: "billDate()",
      title: "Bill Date",
      render: function(val, type, doc){
         return moment(val).format("L");
      }
  }, {
      data: "amount",
      title: " Payment Amounts"
  }, {
      data: "date",
      title: "Payment Date",
      render: function(val, type, doc){
         return moment(val).format("L");
      }
  }, ],
  search: {
    caseInsensitive: true,
    smart: true,
    onEnterOnly: true,
  },
  extraFields: ["bill_id", "payment_type_id"]
});

Payments.attachSchema(new SimpleSchema({
    due: {
      type: Number,
      decimal: true,
      optional: true
    },
    amount: {
      type: Number,
      decimal: true
    },
    date: {
      type: Date,
      defaultValue: new Date()
    },
    payment_type_id: {
      type: String,
      label: 'PaymentType',
      autoform: {
        type: "select",
        options: function(){
          var a = PaymentTypes.find().fetch();
          var r = [];
          a.forEach(function(e) {
            r.push( { label: e.name, value: e._id } );
          });
          return r;
        }
      }
    },
    // orion.attribute('hasOne', {
    //     label: 'PaymentType'
    // }, {
    //     collection: PaymentTypes,
    //     titleField: 'name',
    //     publicationName: 'payment_payment_type_id',
    // }),
    bill_id: {
      type: String,
      label: 'Bill'
    },
    // orion.attribute('hasOne', {
    //     label: 'Bill'
    // }, {
    //     collection: Bills,
    //     titleField: '_id',
    //     publicationName: 'payment_bill_id',
    // }),
    note: {
        optional: true,
        type: String
    },
    claim_id: {
      type: String,
      optional: true,
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
    //     publicationName: 'payment_claim_id',
    // }),
    payor_id: {
      type: String,
      optional: true,
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
    //     publicationName: 'payment_payor_id',
    // }),
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
}));

Payments.helpers({
    type() {
      //console.log(this.payment_type_id);
        var type = PaymentTypes.findOne(this.payment_type_id);
        if (type)
            return type.name;
        else
            return "N/A";
    },
    bill() {
        var bill = Bills.findOne(this.bill_id);
        if (bill)
            return bill;
        else
            return {};
    },

    payor() {
        var bill = this.bill();
        if (bill)
            return bill.payor_name;
        else
            return {};
    },
    patient() {
        var bill = this.bill();
        if (bill)
            return bill.patient_name;
        else
            return {};
    },
    claim() {
        var bill = this.bill();
        if (bill)
            return bill.claim_name;
        else
            return {};
    },
    agency() {
        var bill = this.bill();
        if (bill && bill.patient())
            return bill.patient().agency_id;
        else
            return {};
    },
    billAmount() {
        var bill = this.bill();
        if (bill)
            return bill.amount;
        else
            return {};
    },
    billDate() {
        var bill = this.bill();
        if (bill)
            return bill.date;
        else
            return {};
    },
});
if (Meteor.isServer) {
  function parseDate(dt){
    return moment(dt).format("ll");
  };


  Meteor.publish("bill.payments", function(bill_id){

    return  Payments.find({bill_id: bill_id});
  });

  Payments.after.insert(function(userId, doc) {
      var total = 0;
      var aggr = Payments.aggregate([{
          $match: {
              bill_id: doc.bill_id
          }
      }, {
          $group: {
              _id: null,
              total: {
                  $sum: "$amount"
              }
          }
      }]);
      if (aggr.length > 0) {
          total = aggr[0].total;
      }
      var fields = {};
      fields["paymentsAmount"] = total;
      if (total == 0) {
          fields["LastPaymentsDate"] = Bills.findOne(doc.bill_id).date;
      } else {
          fields["LastPaymentsDate"] = doc.date;
      }
      Bills.update({
          _id: doc.bill_id
      }, {
          $set: fields
      });

      //=============================================
      //audit
      let description = [];
      if (doc.amount)
          description.push("Set \"Amount\" to " + doc.amount);
      if (doc.date)
          description.push("Set \"Date\" to " + parseDate(doc.date));
      if (doc.note)
          description.push("Set \"Note\" to \"" + doc.note + "\"");

      if(userId) Audits.insert({
          "user": userId,
          "date": new Date(),
          "type": "create",
          "description": description,
          "entityTable": "Payments",
          "entityId": doc.bill_id
      });
  });

  Payments.after.update(function(userId, doc, fieldNames, modifier, options) {

      var total = 0;
      var aggr = Payments.aggregate([{
          $match: {
              bill_id: doc.bill_id
          }
      }, {
          $group: {
              _id: null,
              total: {
                  $sum: "$amount"
              }
          }
      }]);
      if (aggr.length > 0) {
          total = aggr[0].total;
      }
      var fields = {};
      fields["paymentsAmount"] = total;
      if (total == 0) {
          fields["LastPaymentsDate"] = Bills.findOne(doc.bill_id).date;
      } else {
          fields["LastPaymentsDate"] = doc.date;
      }
      Bills.update({
          _id: doc.bill_id
      }, {
          $set: fields
      });
      //=============================================
      //audit
      let description = [];
      var previous = this.previous;
      if (doc.amount !== previous.amount)
          description.push("Changed \"Amount\" from " + previous.amount + " to " + doc.amount);
      if (doc.date + "" !== previous.date + "")
          description.push("Changed \"Date\" from " + parseDate(previous.date) + " to " + parseDate(doc.date));
      if (doc.note !== previous.note)
          description.push("Changed the note from \"" + previous.note + "\" to \"" + doc.note + "\"");
      if(userId){
        Audits.insert({
          "user": userId,
          "date": new Date(),
          "type": "update",
          "description": description,
          "entityTable": "Payments",
          "entityId": doc.bill_id
      });
    }
  });

  Payments.after.remove(function(userId, doc) {
      var total = 0;
      var aggr = Payments.aggregate([{
          $match: {
              bill_id: doc.bill_id
          }
      }, {
          $group: {
              _id: null,
              total: {
                  $sum: "$amount"
              }
          }
      }]);
      if (aggr.length > 0) {
          total = aggr[0].total;
      }
      var fields = {};
      fields["paymentsAmount"] = total;
      if (total == 0) {
          fields["LastPaymentsDate"] = Bills.findOne(doc.bill_id).date;
      } else {
          fields["LastPaymentsDate"] = doc.date;
      }
      Bills.update({
          _id: doc.bill_id
      }, {
          $set: fields
      });
      //=============================================
      //audit
      let description = [];
      description.push("\"Date\" " + parseDate(doc.date))
      description.push("\"Amount\" " + doc.amount);
      if(userId){

      Audits.insert({
          "user": userId,
          "date": new Date(),
          "type": "delete",
          "description": [],
          "entityTable": "Payments",
          "entityId": doc.bill_id
      });
    }
  });




  var model = {
      total: 0,
      count: 0,
      todayTotal: 0,
      todayCount: 0,
      name: "",
      type: ""
  };

  function doAggregate(filterType, fromDate, toDate) {
      // need to refactor
      var firstModel, secondModel;
      var firstTypeID, secondTypeID;
      if (filterType == "payor") {
          firstModel = Payors;
          firstTypeID = "payor_id";
          secondModel = PaymentTypes;
          secondTypeID = "payment_type_id";
      } else {
          firstModel = PaymentTypes;
          firstTypeID = "payment_type_id";
          secondModel = Payors;
          secondTypeID = "payor_id";
      }

      var dateMatch = {};
      if (fromDate) {
          dateMatch["$gte"] = new moment(fromDate, "MM/DD/YYYY").startOf("day").utc().toDate()
      }
      if (toDate) {
          dateMatch["$lte"] = new moment(toDate, "MM/DD/YYYY").endOf("day").utc().toDate()
      }

      console.log(dateMatch);
      var aggr = [];
      var data = {};
      var match;


      var firstData = firstModel.find({}, {sort: { priority: -1 }}).map(function(o) {
          return o;
      });
      var secondData = secondModel.find({}, {sort: { priority: -1 }}).map(function(o) {
          return o;
      });
    //  console.log(firstData, secondData);

      var firstHash = {};
      firstModel.find({}, {sort: { priority: -1 }}).map(function(o) {
          firstHash[o._id] = o;
      });

      var secondHash = {};
      secondModel.find({}, {sort: { priority: -1 }}).map(function(o) {
          secondHash[o._id] = o;
      });

      var group = [
                      {"$group":{
                          "_id": {
                              "payment_type_id": "$payment_type_id",
                              "payor_id": "$payor_id",
                          },
                          "total": {$sum: "$amount"},
                          "count": {$sum: 1}
                      }}
                  ];
      if (Object.keys(dateMatch).length > 0) {
          group.unshift({"$match": {"date": dateMatch}})
      }
      group.push({"$sort": {total: -1}});

      aggr = Payments.aggregate(group);
    //  console.log("Aggregate", aggr);
      for (var i = 0, firstName, secondType; i < aggr.length; i++) {
        // THERE IS AN ISSUE HERE NEEDS TO BE FIXED
      //  console.log("first", firstHash[aggr[i]._id[firstTypeID]]);
      //  console.log("second", secondTypeID, aggr[i]);
      //  console.log("second", secondHash[aggr[i]._id[secondTypeID]]);
        if(firstHash[aggr[i]._id[firstTypeID]] && secondHash[aggr[i]._id[secondTypeID]]){
      //    console.log("firstname");
          firstName = firstHash[aggr[i]._id[firstTypeID]].name;
        //  console.log(firstName);
          // console.log(firstName);

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

      var total = 0;
      var count = 0;

      for (first in data) {
          data[first].second.map(function(elm) {
              data[first].total += accounting.unformat(elm.total);
              data[first].count += elm.count;
          });
          total += data[first].total;
          data[first].total = accounting.formatMoney(data[first].total);
          count += data[first].count;
      }
    //  console.log("Data: ", data);
      return {
          data: data,
          total: accounting.formatMoney(total),
          count: count
      };
  }



  Meteor.methods({
    paymentsAggregation: function(filterType, fromDate, toDate, showToday) {
        if (showToday == "show") {
            console.log(filterType, fromDate, toDate, showToday);

            var todayStart = new moment(toDate, "MM/DD/YYYY").startOf("day").utc().toDate();
            var todayEnd = new moment(toDate, "MM/DD/YYYY").endOf("day").utc().toDate();

            var start = new moment(fromDate, "MM/DD/YYYY").startOf("day").utc().toDate();
            var end = new moment(toDate, "MM/DD/YYYY").endOf("day").utc().toDate();


            var todayData = doAggregate(filterType, todayStart, todayEnd);
            var fullData = doAggregate(filterType, start, end);
            fullData.todayTotal = todayData.total;
            fullData.todayCount = todayData.count;
            for (first in todayData.data) {
                fullData.data[first].todayTotal = accounting.formatMoney(todayData.data[first].total);
                fullData.data[first].todayCount = todayData.data[first].count;
                for (var i = 0; i < todayData.data[first].second.length; i++) {
                    fullData.data[first].second[i].todayTotal = accounting.formatMoney(todayData.data[first].second[i].total);
                    fullData.data[first].second[i].todayCount = todayData.data[first].second[i].count;
                }
            }
            return fullData;
        } else {
            return doAggregate(filterType, fromDate, toDate);
        }
    },
    exportAllPayments: function(selector, fields) {
        // console.log(selector);
        var data = [];
        var collectionItems = Payments.find(selector).fetch();
        // console.log(collectionItems);
        var arr = fields.split(",");
        _.each(collectionItems, function(item) {
            var row = [];
            for (i = 0; i < arr.length; i++) {
              switch (arr[i]) {
                case "patient":
                  row.push(item.patient());
                  break;
                case "type":
                  row.push(item.type());
                  break;
                case "billAmount":
                  row.push(item.billAmount());
                  break;
                case "billDate":
                  row.push(item.billDate());
                  break;
                default:
                  row.push(item[arr[i]]);

              }
            }
            data.push(row);
        });
        return { fields: fields.split(","), data: data };
    }
  });
}
export default Payments;
