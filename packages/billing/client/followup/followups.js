
Template.followups.viewmodel({
  headerVariable: {title:"Follow Ups",subtitle:"List of all bill follow ups",hasBack:false},
  onCreate: function(){
  },
  autorun: function(){
    this.templateInstance.subscribe("billFollowups", "Bills");
    this.templateInstance.subscribe("userProfiles")
  },
  onRendered: function(){

  },
  followup: function(){
    return FollowUps.find({},{sort: {
      date:-1
    }}).fetch();
  },
  isDone: function(done){
    if (done)
      return "checked";
    return;

  },
  parseDate: function(date) {
      return moment(date).format("MM/DD/YYYY")
  },
  events:{
    "change .followUpDone"(event){
      console.log("followUpDone");
      var wasDone = event.target.getAttribute("data-done");
      console.log(FollowUps.update({_id:event.target.getAttribute("data-idfollowup")},{$set: {done: !wasDone}}));
    }
  }
});
