var date_regex = /((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d)|((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])(19|20)\d\d)/;
var validateDate = function(id, value){
  if(!date_regex.test(value) && value){
    if(!$("#"+id).hasClass("invalid"))
      $("#"+id).toggleClass("invalid");
  }
  else{
    if($("#"+id).hasClass("invalid"))
      $("#"+id).toggleClass("invalid");
  }
};
AutoForm.hooks({
    "updateFollowUpForm": {
        onSuccess: function(doc) {
            Session.set("editFollowup", false);
            Session.set("followupId", event.target.getAttribute("data-idfollowup"));
        },
        onError: function(a, error, b) {},
    },
    "addFollowUpForm": {
        onSuccess: function(doc) {
          $("#addFollowUpForm #followUpDate").val(moment(new Date()).format("MM/DD/YYYY"));
          $("label[for='followUpDate']").addClass("active");
        },
        onError: function(a, error, b) {},
    },
    // "editBillForm":{
    //   before: {
    //     update: function(doc) {
    //       console.log(doc.$set);
    //       if(doc.$set.claim_start_date && doc.$set.claim_end_date){
    //         if(moment(doc.$set.claim_start_date,"MM/DD/YYYY").isAfter(moment(doc.$set.claim_end_date,"MM/DD/YYYY"))
    //            || moment(doc.$set.claim_start_date,"MM/DD/YYYY").isSame(moment(doc.$set.claim_end_date,"MM/DD/YYYY"))){
    //           $(".date-error").show();
    //           return false;// (synchronous, cancel)
    //         }
    //         else{
    //           $(".date-error").hide();
    //           return doc;
    //         }
    //       }
    //       $(".date-error").hide();
    //       return doc;
    //     },
    //   },
    // }
});

// Template.billCreate.onRendered(function() {
//     $("label").addClass("active");
// });

Template.billEdit.viewmodel({
    headerVariable: {title:"Edit Bill",subtitle:"Editing bill details",hasBack:true},
    onCreated: function() {
        Meteor.subscribe("followups", "Bills", Router.current().params._id);
        Meteor.subscribe("userProfiles");
    },
    onRendered: function() {
      // console.log($("#checkdiv").hasClass("dates-initialized"));
      if(!$("#checkdiv").hasClass("dates-initialized")){
        setTimeout(function() {
            var billDate = new Pikaday({
                field: document.getElementById('billDate'),
                format: 'MM/DD/YYYY'
            });
            var claimStartDate = new Pikaday({
                field: document.getElementById('claimStartDate'),
                format: 'MM/DD/YYYY'
            });
            var claimEndDate = new Pikaday({
                field: document.getElementById('claimEndDate'),
                format: 'MM/DD/YYYY'
            });
            var followUpDate = new Pikaday({
                field: document.getElementById('followUpDate'),
                format: 'MM/DD/YYYY'
            });
            $("#checkdiv").addClass("dates-initialized")
        }, 500);
      }

        Session.set("editFollowup", false);
        Session.set("followupId", "");
    },
    initializeDate: function() {
        setTimeout(function() {
            var editFollowUpDate = new Pikaday({
                field: document.getElementById('editFollowUpDate'),
                format: 'MM/DD/YYYY'
            });
        }, 500);

    },
    edit: function(id) {
        // Session.set(, event.target.getAttribute("data-idfollowup"));
        if (Session.get("followupId") === id)
            return Session.get("editFollowup")
        else {
            return false;
        }
    },

    beforeRemoveHelperFollowup: function() {
        return function(collection, id) {
            var doc = collection.findOne(id);
            if (confirm('Are you sure you want to delete this follow up ?')) {
                this.remove();
            }
        };
    },
    bill: function() {
        if (Router.current().params._id)
            return Bills.findOne(Router.current().params._id);
        return null;
    },
    billDate: function() {
        if (this.bill())
            return moment(this.bill().date).utc().format("MM/DD/YYYY")
    },
    claimStart: function() {
        if (this.bill())
            return moment(this.bill().claim_start_date).utc().format("MM/DD/YYYY")
    },
    claimEnd: function() {
        if (this.bill())
            return moment(this.bill().claim_end_date).utc().format("MM/DD/YYYY")
    },
    followUps: function() {
        if (this.bill()) {
            return FollowUps.find({
                "entityId": this.bill()._id
            }, {
                sort: {
                    createdAt: -1
                }
            }).fetch();
        }
    },
    parseDateTime: function(dt){
      return moment(dt).utc().format("MM/DD/YYYY HH:MM:ss")
    },
    parseDate: function(date) {
        return moment(date).utc().format("MM/DD/YYYY")
    },
    userName: function(id) {
        return Meteor.users.findOne(id).profile.name
    },
    userId: function() {
        return Meteor.userId()
    },
    followupDate: function() {
        fUp = FollowUps.findOne(Session.get("followupId"));
        if (fUp)
            return moment(fUp.date).utc().format("MM/DD/YYYY");
    },
    isDone: function(done){
      if (done)
        return "checked";
      return;

    },
    today:  moment(new Date()).utc().format("MM/DD/YYYY"),
    events: {
        "click #submitbtn": function() {
            setTimeout(function() {
                var billDate = new Pikaday({
                    field: document.getElementById('billDate'),
                    format: 'MM/DD/YYYY'
                });
                var claimStartDate = new Pikaday({
                    field: document.getElementById('claimStartDate'),
                    format: 'MM/DD/YYYY'
                });
                var claimEndDate = new Pikaday({
                    field: document.getElementById('claimEndDate'),
                    format: 'MM/DD/YYYY'
                });
            }, 1000);
        },
        // "blur #billDate" (event) {
        //     validateDate("billDate", $("#billDate").val());
        // },
        // "blur #claimStartDate" (event) {
        //     validateDate("claimStartDate", $("#claimStartDate").val());
        //     if(moment($("#claimStartDate").val(),"MM/DD/YYYY").isAfter(moment($("#claimEndDate").val(),"MM/DD/YYYY"))
        //     || moment($("#claimStartDate").val(),"MM/DD/YYYY").isSame(moment($("#claimEndDate").val(),"MM/DD/YYYY"))){
        //       $(".date-error").show();
        //       $(".edit-bill #submitbtn").prop('disabled', true)
        //     }else{
        //       $(".date-error").hide();
        //       $(".edit-bill #submitbtn").prop('disabled', false)
        //     }
        // },
        // "blur #claimEndDate" (event) {
        //     validateDate("claimEndDate", $("#claimEndDate").val());
        //     if(moment($("#claimStartDate").val(),"MM/DD/YYYY").isAfter(moment($("#claimEndDate").val(),"MM/DD/YYYY"))
        //     || moment($("#claimStartDate").val(),"MM/DD/YYYY").isSame(moment($("#claimEndDate").val(),"MM/DD/YYYY"))){
        //       $(".date-error").show();
        //       $(".edit-bill #submitbtn").prop('disabled', true)
        //     }else{
        //       $(".date-error").hide();
        //       $(".edit-bill #submitbtn").prop('disabled', false)
        //     }
        // },
        "blur #followUpDate" (event) {
            validateDate("followUpDate", $("#followUpDate").val());
        },
        "click #editFollowUp" (event) {
            Session.set("editFollowup", true);
            Session.set("followupId", event.target.getAttribute("data-idfollowup"));
        },
        "change .followUpDone"(event){
          var wasDone = event.target.getAttribute("data-done");
          FollowUps.update({_id:event.target.getAttribute("data-idfollowup")},{$set: {done: !wasDone}});
        }
    }
});

Template.auditTrails.viewmodel({
    onCreated() {
        Meteor.subscribe("audits", Router.current().params._id);
    },
    audits: function() {
        if (Router.current().params._id)
            return Audits.find({
                "entityId": Router.current().params._id
            }, {
                sort: {
                    date: -1
                }
            });
        return null;
    },
    auditTitle: function(audit) {
        var text = "";
        if (audit.type == "update") {
            text += " made an update";
        } else if (audit.type == "create") {
            switch (audit.entityTable) {
                case "Bills":
                    text += "created bill instance";
                    break;
                case "Payments":
                    text += "added a payment";
                    break;
                case "Comments":
                    text += "added a comment";
                    break;
            }
        } else if (audit.type == "delete") {
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
        return moment(dt).utc().format("MM/DD/YYYY HH:MM");
    },
    isDelete(audit){
      if (audit.type == "delete" ){
        return true;
      }
    }
});

Template.addComment.helpers({
    billId: function() {
        return Router.current().params._id
    },
    userId: function() {
        return Meteor.userId();
    },
    // events: {
    //     "click #btnRead": function(event, template) {
    //         if ($("#commentText").val() !== "") {
    //             Comments.insert({
    //                 entityId: Router.current().params._id,
    //                 user: Meteor.userId(),
    //                 content: $("#commentText").val(),
    //                 collection: "Bills"
    //             });
    //             $("#commentText").val('');
    //         }
    //     }
    // }
});
