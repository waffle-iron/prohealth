import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  var roles = [
   new Roles.Role("hr"),
   new Roles.Role("hr-admin"),
   new Roles.Role("billing"),
   new Roles.Role("billing-admin"),
   new Roles.Role("sales"),
   new Roles.Role("sales-admin"),
   new Roles.Role("payroll"),
   new Roles.Role("payroll-admin")
  ];
  for(var role in roles){
    // Allows the role to see all documents
    roles[role].helper('collections.patients.indexFilter', {});
  }

  // remove all supervisors
  // console.log(Agents.update({}, {$unset:{supervisor:""}}, {multi:true}));
  // CREATE PATIENTS CRON JOB
  SyncedCron.add({
    name: 'patients cron job',
    schedule: function(parser) {
      // parser is a later.parse object
      return parser.recur().on('8:00:00').time();
    },
    job: function() {
      var updatePatients = function(){
        Meteor.call('patients.update', moment(new Date()).subtract(1,"days").format("MM/DD/YYYY"), moment(new Date()).format("MM/DD/YYYY"), 10000);
      }
      var callUpdate = updatePatients();
      return callUpdate;
    }
  });
  //START SYNCED CRON
  SyncedCron.start();
  // SyncedCron.stop()
});
if(Meteor.isServer){
  Meteor.publish("userProfiles", function() {
    return Meteor.users.find({}, {
      fields : {
        'profile' : 1
      }
    });
  });

  Meteor.publish("user", function() {
    return Meteor.users.find({
      _id: this.userId
    }, {
      fields: {
        roles: true
      }
    });
  });
}
