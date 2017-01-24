import CompensationTypes from "./compensation_types"
import Agents from './agents'
import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';

CompensationRates = new Mongo.Collection('compensation_rates');

TabularTables.CompensationRates = new Tabular.Table({
  name: "CompensationRates",
  collection: CompensationRates,
  columns: [
      { data: "agent", title: "Agent ID" },
      { data: "compensation_type", title: "Compensation Type" },
      { data: "amount", title: "Amount" }
  ]
});

CompensationRates.attachSchema(new SimpleSchema({
    agent: {
      type: String,
      optional: true,
    },
    compensation_type: {
      type: String,
      optional: true
    },
    amount: {
        type: Number,
        decimal: true,
        min: 0
    }
}));

CompensationRates.helpers({
  name() {
    if(this.compensation_type)
        return CompensationTypes.findOne(this.compensation_type).name;
  }
});

Meteor.methods({
  rateDelete(id){
    return CompensationRates.remove(id);
  }
});

if (Meteor.isServer) {
  var types = CompensationTypes.find({name: { $in: ["Complex","Out of area","Mileage"] }}).fetch()
  types = types.map(function(type){
            return type._id;
          });
  var rates = CompensationRates.find({ "agent": { $exists: false } , compensation_type: {$in:types}});
  // console.log(rates.count());
  if (rates.count() < 1) {
    types.forEach(function(type){
      CompensationRates.insert({compensation_type: type , amount: 0});
    });
  }
  Meteor.publish("agentRates", function(agent_id){
    return CompensationRates.find({agent: agent_id});
  });
  // publish complex - out of area and mileage
  Meteor.publish("reimb", function(){
      return rates;
    });
  Meteor.publish("allRates", function(){
    return CompensationRates.find();
  });
  Meteor.publish("rate", function(id){
    return CompensationRates.find({_id: id});
  });
}
if (Meteor.isClient) {

}

export default CompensationRates;
