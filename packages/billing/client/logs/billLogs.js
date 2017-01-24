
Template.billLogs.viewmodel({
  headerVariable: {title:"Bill Audits",subtitle:"List of all bill logs",hasBack:false},
  onCreated() {
      Meteor.subscribe("bill-audits");
      Meteor.subscribe("userProfiles")
  },
  audits: function() {
          return Audits.find({}, {
              sort: {
                  date: -1
              }
          });
      return null;
  },
  auditTitle: function(audit) {
      var text = "";
      if (audit.type == "delete") {
          switch (audit.entityTable) {
              case "Bills":
                  text += "deleted a bill instance";
                  break;
              case "Payments":
                  text += "deleted a payment";
                  break;
          }
      }

      return text;
  },
  auditUser: function(audit) {
      return Meteor.users.findOne(audit.user).profile.name;
  },
  blockQuoteColor: function(audit) {
      if (audit.type == "create" && audit.entityTable == "Bills") {
          return "blue-text text-darken-1";
      } else if (audit.entityTable == "Comments") {
        return "cyan-text text-darken-4"
      } else if (audit.type == "create") {
          return "green-text text-accent-4";
      } else if (audit.type == "delete") {
          return "red-text text-darken-1";
      } else {
          return "grey-text text-darken-4";
      }
  },
  parseDate: function(dt) {
      return moment(dt).format("MM/DD/YYYY HH:MM");
  },
  isDelete(audit){
    if (audit.type == "delete" ){
      return true;
    }
  }
});
