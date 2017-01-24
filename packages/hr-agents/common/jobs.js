import Tabular from 'meteor/aldeed:tabular';

TabularTables.Jobs = new Tabular.Table({
  name: "Jobs",
  collection: Jobs,
  columns: [
      { data: "name", title: "Name" },
      { data: "description", title: "Description" },
      {
        tmpl: Meteor.isClient && Template.editbutton
      },
      {
        tmpl: Meteor.isClient && Template.delbutton
      }
  ]
});
