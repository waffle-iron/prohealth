import './visitDetails.html';

Template.visitDetails.viewmodel({
  headerVariable:{title:"Visit Details",subtitle:"Viewing visit details and comments",hasBack:true},
onCreated(){
  Meteor.subscribe("visit", this.visitId());
  Meteor.subscribe("comments", "Visits", this.visitId());
  Meteor.subscribe("usersNames");
},
autorun(){

},
visitId(){
  return  Router.current().params._id;
},
    visit: function() {
        return Visits.findOne(Router.current().params._id);
    },
    parseDateVD: function(date){
      return moment(date).utc().format("MM/DD/YYYY");
    },
    fixKey(key){
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
    },
    validationKeys(){
      if(this.visit() && this.visit().validationDetails){
        let validation = this.visit().validationDetails;
        delete validation["valid"];
        return Object.keys(validation);
      }

    },
    validSection(section){
      return this.visit().validationDetails[section].valid;
    },
    comments: function() {
        if (Router.current().params._id)
            return Comments.find({
                "entityId": Router.current().params._id

            }, {
                sort: {
                    date: -1
                }
            });
        return null;
    },


    commentTitle: function(comment) {
        var text = "added a comment";
        return text;
    },
    commentUser: function(comment) {
        return Meteor.users.findOne(comment.user).profile.name;
    },
    parseDate: function(dt) {
        return moment(dt).format("MM/DD/YYYY HH:MM");
    },
    isTimeInOUt: function(){
      if(this.visit().timeIn && this.visit().timeOut){
        return true;
      }
      return false;
    }
});

Template.visitDetails.events({
    "click #back": function(event, template) {
        history.back();
    },
    "click #btnRead": function(event, template) {
        if ($("#commentText").val() !== "") {
            Comments.insert({
                entityId: Router.current().params._id,
                user: Meteor.userId(),
                content: $("#commentText").val(),
                collection: "Visits"
            });
            $("#commentText").val('');
        }
    }
});
