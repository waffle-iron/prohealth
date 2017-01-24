import "./upload.js";

Meteor.methods({
  'delete_job'(jobid){
    if (Meteor.user() && Meteor.user().hasRole("hr-admin") && Jobs.remove({_id: jobid})) {
      return true;
    }
    else {
      throw new Meteor.Error("Deletion Error");
    }
  },
  "changepassword"(userid,newpass){
      Accounts.setPassword(userid, newpass)
  }
});
