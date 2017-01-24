
Template.modal.viewmodel({
    notRejected: function(){
      return Router.current().params.query.billingState != "rejected";
    },
    parseDate: function(dt) {
        return moment(dt).format("MM/DD/YYYY HH:MM");
    },
    commentUser: function(comment) {
        return Meteor.users.findOne(comment.user).profile.name;
    },
    comments: function() {
        if (Session.get("sendID")) {
            return Comments.find({
                "entityId": Session.get("sendID")
            }, {
                sort: {
                    date: -1
                }
            });
        } else {
            return null;
        }
    },
});

Template.modal.events({
"click #back": function(event, template) {
    history.back();
},
"click #btnRead": function(event, template) {
    if ($("#commentText").val() !== "") {
        Comments.insert({
            entityId: Session.get("sendID"),
            user: Meteor.userId(),
            content: $("#commentText").val(),
            collection: "Visits"
        });
        if(Session.get("isReject")){
            Visits.update({_id: Session.get("sendID")}, {
                $set: {
                    billingState: "rejected"
                }
            });
            Session.set("isReject", false);
            $("#modal1").closeModal();
        } else if(Session.get("isComplex")){
          Visits.update({_id: Session.get("sendID")},{$set:{complex:true}})
          Session.set("isComplex",false);
          $("#modal1").closeModal();
        }
        $("#commentText").val('');
    }
},
"click #btnClose"(event){
  $("#modal1 #complexError").hide();
  $("#modal1 #rejectError").hide();
  Session.set("isReject", false);
  Session.set("isComplex",false);
  Session.set("sendID","");
}
});
