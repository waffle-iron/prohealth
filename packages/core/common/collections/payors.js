import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';
Payors = new Mongo.Collection('payors');
TabularTables.Payors = new Tabular.Table({
    name: "Payors",
    collection: Payors,
    columns: [
      {data: "name"}
    ]
});

Payors.attachSchema(new SimpleSchema({
    name: {
        type: String
    },
}));

if(Meteor.isServer){

    Meteor.publish("payors", function(){
      return Payors.find({});
    });
    if (Payors.find().count() < 1) {
      ["Medicare", "Other", "Care 1st", "Aetna", "Humana", "Blue Cross", "United", "CCHP", "MediCal", "EasyChoice", "Blue Shield", "CHCN", "SCFHP", "VHP", "PAVA", "Alameda Alliance", "HP San Mateo", "Kaiser Comm.", "Kaiser Sen. Med. Adv.", "Central California Alliance", "Stanford Health Care Advantage", "BlueCross Cal MediConnect", "SCFHP Cal MediConnect Plan"].forEach(function(item){
        Payors.insert({name: item});
      })
        // Payors.insert({name: "Medicare" });
        // Payors.insert({name: "Other" });
        // Payors.insert({name: "Care 1st" });
        // Payors.insert({name: "Aetna" });
        // Payors.insert({name: "Humana" });
        // Payors.insert({name: "United" });
        // Payors.insert({name: "Blue Cross" });
        // Payors.insert({name: "CCHP" });
        // Payors.insert({name: "Medical" });
        // Payors.insert({name: "EasyChoice" });
        // Payors.insert({name: "CHCN" });
        // Payors.insert({name: "Blue Shield" });
        // Payors.insert({name: "SCFHP" });
        // Payors.insert({name: "VHP" });
        // Payors.insert({name: "PAVA" });
        // Payors.insert({name: "Alameda Alliance" });
        // Payors.insert({name: "Kaiser Comm." });
        // Payors.insert({name: "HP San Mateo" });
        // Payors.insert({name: "Kaiser Sen. Med. Adv." });
    }
}

export default Payors;
