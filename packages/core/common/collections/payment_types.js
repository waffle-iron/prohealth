import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';
PaymentTypes = new Mongo.Collection('payment_types');
TabularTables.PaymentTypes = new Tabular.Table({
  name: "PaymentTypes",
  collection: PaymentTypes,
  columns: [
    {data: "name"}
  ]
});

PaymentTypes.attachSchema(new SimpleSchema({
    name: {
        type: String
    },
}));

if(Meteor.isServer){
    Meteor.publish("payment_types", function(){
      return PaymentTypes.find({});
    });
    if (PaymentTypes.find().count() < 1) {
      ["RAP", "RAP TB", "HOSPICE", "HOSPICE R&B", "FINAL", "LUPA", "ADR", "WRITE OFF", "HOSPICE TB", "PEP", "NON ADMIT", "FINAL TB", "unassign"].forEach(function (item) {
        PaymentTypes.insert({name: item });
      })
    }
}

export default PaymentTypes;
