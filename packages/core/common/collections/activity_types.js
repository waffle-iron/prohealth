import CompensationTypes from "./compensation_types";
import TabularTables from './index';
import Tabular from 'meteor/aldeed:tabular';

ActivityTypes = new Mongo.Collection('activity_types');

TabularTables.ActivityTypes = new Tabular.Table({
  name: "ActivityTypes",
  collection: ActivityTypes,
  columns: [
    { data: "name", title: "Name" }
  ],
});

ActivityTypesSchema = new SimpleSchema({
    name: {
        type: String
    },

    creatable: {
        type: Boolean,
        defaultValue: true
    },

    rid: {
        type: Number,
        optional: true
    },

    // compensation_types: orion.attribute(
    //   'hasMany',
    //   {
    //       label: 'Compensation Types',
    //       optional: true
    //   },
    //   {
    //       collection: CompensationTypes,
    //       titleField: 'name',
    //       additionalFields: [], // we must add the active field because we use it in the filter
    //       publicationName: 'activity_type_compensation_types',
    //   }
    // ),

    complex: {
        type: Boolean,
        optional: true
    },

    out_of_area: {
        type: Boolean,
        optional: true
    },

    mileage: {
        type: Boolean,
        optional: true
    }
});


ActivityTypes.attachSchema(ActivityTypesSchema);

if (Meteor.isServer) {
  Meteor.publish("activity_types", function(){
    return ActivityTypes.find({});
  });
}

export default ActivityTypes;
