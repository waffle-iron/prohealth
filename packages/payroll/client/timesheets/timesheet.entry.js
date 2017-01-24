Template.timesheetEntry.viewmodel({
    doc() {
        return Visits.findOne(this._id());
    },
    formId(){
      return this._id()+"edit"
    },
    isChecked(id){
      var visit = Visits.findOne({_id:id});
      if(visit){
        if(visit.complex){
          return "checked"
        }
      }
    },
    autorun() {
        Meteor.subscribe("visit", this._id());
        Meteor.subscribe("comments", "Visits", this._id());
    },
    date(date) {
        return moment(date, "MM/DD/YYYY").utc().format("MM/DD/YYYY");
    },
    billingStateIs(state) {
        if (this.templateInstance.data)
            return this.templateInstance.data.billingState == state;
    },
    price() {
        if (this.doc())
            return accounting.formatMoney(this.doc().cost);
    },
    visit: function(id){
      return Visits.findOne({_id:id});
    },
    comments: function() {
        if (this._id()) {
            return Comments.find({
                "entityId": this._id()
            }, {
                sort: {
                    date: -1
                }
            });
        } else {
            return null;
        }
    },
    lastComment: function() {
        if (this._id()) {
            // console.log(usr.substr(0,str.indexOf(' ')));
            comment = Comments.findOne({
                "entityId": this._id()
            }, {
                sort: {
                    date: -1
                },
                limit: 1
            });
            if (comment) {
                if (Meteor.users.findOne(comment.user)) {
                    user = Meteor.users.findOne(comment.user).profile.name;
                    if(user.indexOf(",")>-1)
                      return user.substr(0, user.indexOf(",")) + ": " + comment.content;
                    else
                      return user + ": " + comment.content;
                }
            }
        } else {
            return null;
        }
    },
    commentsLength: function() {

        var id = this._id();
        if (this._id())
            return Comments.find({
                "entityId": this._id()
            }, {
                sort: {
                    date: -1
                }
            }).fetch().length;
        return null;
    },
    isAdmin: function() {
        return Router.current().url.indexOf("pendingTimesheet") > 0;
    },
    commentTitle: function(comment) {
        var text = "added a comment";
        return text;
    },
    commentUser: function(comment) {
      if(Meteor.users.findOne(comment.user))
        return Meteor.users.findOne(comment.user).profile.name;
    },
    parseDate: function(dt) {
        return moment(dt, "MM/DD/YYYY").format("MM/DD/YYYY HH:MM");
    },
    formType: function() {
        // console.log(this._id());
        // var visit = Visits.findOne(this._id());
        if (this.doc())
            return this.doc().billingState == "logged" ? "update" : "disabled";
    },
    events: {
      "change .complexCheckbox"(event){
        console.log(event.target.checked);
        if(event.target.checked){
          Session.set("sendID", event.target.id);
          Session.set("isComplex",true);
          $("#modal1").openModal();
          $("#modal1 #complexError").show();
          $("#"+event.target.id+".complexCheckbox").attr('checked', false);
        } else {
          Visits.update({_id:event.target.id},{$set:{complex:false}});
        }
      },
        "click .btn-request" (event) {
            var visit = Visits.findOne($(event.currentTarget).data("id"));
            if (visit && (visit.complex || visit.out_of_area || visit.mileage > 0.05)) {
                Visits.update($(event.currentTarget).data("id"), {
                    $set: {
                        billingState: "pending"
                    }
                });
            } else {
                Visits.update($(event.currentTarget).data("id"), {
                    $set: {
                        billingState: "approved"
                    }
                });
            }
        },
        "click .btn-approve" (event) {
            //console.log($(event.target).data("id"));
            var visit = Visits.findOne($(event.currentTarget).data("id"));
            if (visit) {
                Visits.update($(event.currentTarget).data("id"), {
                    $set: {
                        billingState: "approved"
                    }
                });
            }
        },
        "click .btn-reject" (event) {
            //console.log($(event.target).data("id"));
            Session.set("sendID", $(event.target).data("id"));
            Session.set("isReject", true);
            $("#modal1").openModal();
            $("#modal1 #rejectError").show();

            // var visit = Visits.findOne($(event.currentTarget).data("id"));
            // if (visit) {
            //     Visits.update($(event.currentTarget).data("id"), {
            //         $set: {
            //             billingState: "rejected"
            //         }
            //     });
            // }
        },
        "click #btnComment" (event) {
            Session.set("sendID", this._id());
            $('#modal1').openModal();
            // $("#" + this._id() + " #commentBlock").toggleClass("hideBlock");
        },
        "click #btnRead" (event, template) {
            if ($("#commentText").val() !== "") {
                Comments.insert({
                    entityId: this._id(),
                    user: Meteor.userId(),
                    content: $("#commentText").val(),
                    collection: "Visits"
                });
                $("#commentText").val('');
            }
        }
    },
    onRendered: function() {
        $('.modal-trigger').leanModal({
            dismissible: true, // Modal can be dismissed by clicking outside of the modal
            opacity: 0.5, // Opacity of modal background
            in_duration: 300, // Transition in duration
            out_duration: 200, // Transition out duration
            starting_top: '4%', // Starting top style attribute
            ending_top: '10%', // Ending top style attribute
        });
    },
    onCreated: function() {}
});
