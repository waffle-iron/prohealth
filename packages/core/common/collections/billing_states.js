import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';

BillingStates = new Mongo.Collection('billing_states');

TabularTables.BillingStates = new Tabular.Table({
  name: "BillingStates",
  collection: BillingStates,
        columns: [
            { data: "name", title: "Name" }
        ]
});

BillingStates.attachSchema(new SimpleSchema({
    name: {
        type: String
    }
}));

if (Meteor.isServer) {
  Meteor.publish("billing_states", function(){
    return BillingStates.find({});
  });
}
if (Meteor.isClient) {

}

export default BillingStates;
