import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';

Visits = new Mongo.Collection('visits');

TabularTables.Visits = new Tabular.Table({
  name: "Visits",
  collection: Visits,
  columns: [
    { data: "activityId", title: "ID" },
    { data: "user", title: "User" },
    { data: "patient", title: "Patient" },
    // { data: "agency", title: "Agency" },
    // { data: "insurance", title: "Insurance" },
    { data: "form", title: "Form" },
    { data: "formStatus", title: "Form Status" },
    { data: "billingState", title: "Billing State" },
    {
      data: "formDate",
      title: "Date",
      render: function (val, type, doc) {
        return moment(val).utc().format("MM/DD/YYYY");
      }
    },
    {data: "timeIn", title: "Time In"},
    {data: "timeOut", title: "Time Out"},
    {data: "validStatus", title: "Valid"},
    {
      title: "View",
      tmpl: Meteor.isClient && Template.visitCheck
    },
  ],
  extraFields: ["timeIn", "timeOut", "activityId"] ,

  "order": [[ 6, 'desc' ]],
  "pageLength": 25,
  "autoWidth": false
});

Visits.attachSchema(
  new SimpleSchema({
    activityId: { type: Number, label: "Activity ID", optional: true},
    patient: { type: String, label: "Patient" , optional: true},
    medicalRecord: { type: String, label: "Medical Record", optional: true },
    chartStatus: { type: String, label: "Chart Status" , optional: true},
    agency: { type: String, label: "Agency" , optional: true},
    insurance: { type: String, label: "Insurance" , optional: true},
    formStatus: { type: String, label: "Form Status" , optional: true},
    formDate: { type: Date, label: "Form Date" },
    user: { type: String, label: "User" },
    billingCode: { type: String, label: "Billing Code", optional: true },
    timeIn: { type: String, label: "Time In", optional: true },
    timeOut: { type: String, label: "Time Out", optional: true },
    new: { type: String, label: "New Record", optional: true},
    billingState: {type: String, label: "State", optional: true, defaultValue: "logged"},
    complex: {type: Boolean, label: "Complex", optional: true, defaultValue: false},
    out_of_area: {type: Boolean, label: "Out Area", optional: true, defaultValue: false},
    mileage: {type: Number, decimal: true, label: "Mileage", optional: true, defaultValue: 0},
    cost: {type: Number, decimal: true, label: "Cost", defaultValue: 0, optional: true},
    form: {
        type: String,
        optional: false,
        label: "Activity Type",
        autoform: {
            type: "select",
            options: function() {
                return [
                  {
                    label: "Office Hours",
                    value: "Office Hours"
                  },
                  {
                    label: "On Call",
                    value: "On Call"
                  }
                ]
              }

            }
        },
    validStatus: {type: String, optional: true, label: "Status"},
    validationDetails: {type: Object, optional: true, label: "Validation", blackbox: true}

  })
);

if (Meteor.isServer){
  Visits.before.upsert(function(userId, selector, modifier, options){
    let doc = modifier.$set;
    // initiaize baseCost
    let formRate = 0;
    let baseCost = 0;
    let agent;
    // FIND AGENT
    if(doc.user){
       agent = Agents.findOne({"name": doc.user.replace(/\((.*?)\)/,"").trim()});
      console.log("Agent => "+agent);
    }

    //FIND RATE
    let rate = CompensationTypes.findOne({"name": doc.form});
    console.log("Rate => "+rate);
    // CHECK IF AGENT EXISISTS
    if(agent){
      if(rate){
        let formRate = CompensationRates.findOne({agent: agent._id, compensation_type:rate._id});
        if(formRate){
          baseCost = formRate.amount;
        }
        else{
          // insert rate?
        }
      }
      else{
        CompensationTypes.insert({"name": doc.form,"multi":false});
        // insert agent compensation rate?
      }
    }
    else{
      // insert agent?
      // then check for rate
      // if(rate){
      //   var formRate = CompensationRates.findOne({agent: agent._id, compensation_type:rate._id});
      //   if(formRate)
      //     baseCost = formRate.amount;
      //   else {
      //     // insert rate?
      //   }
      // } else {
      //   CompensationTypes.insert({"name": doc.form,"multi":false});
      //   // insert agent compensation rate?
      // }
    }
    let cost = baseCost;
    if(doc.complex){
      let rate = CompensationTypes.findOne({"name":"Complex"});
      if(rate){
        let comp_rate = CompensationRates.findOne({"compensation_type": rate._id});
        if(comp_rate){
          cost += comp_rate.amount;
        }
      }
    }
    if(doc.out_of_area){
      let rate = CompensationTypes.findOne({"name":"Out of area"});
      if(rate){
        var comp_rate = CompensationRates.findOne({"compensation_type": rate._id});
        if(comp_rate)
          cost += comp_rate.amount;
      }
    }
    if(doc.mileage>0){
      let rate = CompensationTypes.findOne({"name":"Mileage"});
      if(rate){
        var comp_rate = CompensationRates.findOne({"compensation_type": rate._id});
        if(comp_rate)
          cost += (comp_rate.amount*doc.mileage);
      }
    }
    modifier["$set"].cost = cost;
  });

  // FIX FORM DATE FOR CORRECT AGGREGATION
  Visits.before.insert(function (userId, doc) {
    console.log(doc.formDate);
    doc.formDate = moment(doc.formDate).utc()._d;
  });

  // UPDATE COST
  Visits.before.update(function (userId, doc, fieldNames, modifier){
    // UPDATE BASE COST OF VISIT FORM
    //=============================================
    let baseCost = 0;
    let agent = "";
    if(doc.user){
       agent = Agents.findOne({"name": doc.user.replace(/\((.*?)\)/,"").trim()});
    }
    //FIND RATE
    let rate = CompensationTypes.findOne({"name": doc.form});
    // CHECK IF AGENT EXISISTS
    if(agent){
      if(rate){
        let formRate = CompensationRates.findOne({agent: agent._id, compensation_type:rate._id});
        if(formRate){
          baseCost = formRate.amount;
        }
      }
      else{
        CompensationTypes.insert({"name": doc.form,"multi":false});
      }
    }
    let cost = baseCost;
    //================================================
    let modDoc = modifier["$set"];
    if(fieldNames.indexOf("complex")>-1 || fieldNames.indexOf("out_of_area")>-1 || fieldNames.indexOf("mileage")>-1){
        if(modDoc.complex == true){
          let rate = CompensationTypes.findOne({"name":"Complex"});
          if(rate){
            let comp_rate = CompensationRates.findOne({"compensation_type": rate._id});
            if(comp_rate)
              cost += comp_rate.amount;
          }
        } else if(modDoc.complex == null){
          if(doc.complex){
            let rate = CompensationTypes.findOne({"name":"Complex"});
            if(rate){
              let comp_rate = CompensationRates.findOne({"compensation_type": rate._id});
              if(comp_rate)
                cost += comp_rate.amount;
            }
          }
        }
        if(modDoc.out_of_area){
          let rate = CompensationTypes.findOne({"name":"Out of area"});
          if(rate){
            let comp_rate = CompensationRates.findOne({"compensation_type": rate._id});
            if(comp_rate)
              cost += comp_rate.amount;
          }
        } else if(modDoc.out_of_area == null){
          if(doc.out_of_area){
            let rate = CompensationTypes.findOne({"name":"Out of area"});
            if(rate){
              let comp_rate = CompensationRates.findOne({"compensation_type": rate._id});
              if(comp_rate)
                cost += comp_rate.amount;
            }
          }
        }
        if(modDoc.mileage>0){
          let rate = CompensationTypes.findOne({"name":"Mileage"});
          if(rate){
            let comp_rate = CompensationRates.findOne({"compensation_type": rate._id});
            if(comp_rate)
              cost += (comp_rate.amount*modDoc.mileage);
          }
        } else if(modDoc.mileage == null){
          if(doc.mileage){
            let rate = CompensationTypes.findOne({"name":"Mileage"});
            if(rate){
              let comp_rate = CompensationRates.findOne({"compensation_type": rate._id});
              if(comp_rate)
                cost += comp_rate.amount;
            }
          }
        }
        modifier['$set'].cost = cost;
    }
  });

  Meteor.publish("agentVisits", function(){
    if(this.userId){
      var user  = Meteor.users.findOne(this.userId);
      if(user && user.profile && user.profile.name){
        console.log("Total Visits Published");
        console.log(Visits.find({user: user.profile.name}).count());
        return Visits.find({user: user.profile.name});
      }
    }
  });
  //need to check for permissions
  Meteor.publish("visit", function(id){
        return Visits.find({_id: id});
    });
  Meteor.publish("agentVisitsByName", function(name){
    console.log(name);
      return Visits.find({user: {$regex : ".*"+name+".*"}});
  });

    Meteor.methods({
      exportAllVisits: function(selector, fields) {
          console.log(selector);
          var data = [];
          var collectionItems = Visits.find(selector).fetch();
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
}


export default Visits;
