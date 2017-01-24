Template.changePassword.viewmodel({
    headerVariable: function(){
      var title = Meteor.user().profile.name;
      return {title:title,subtitle:"Editing Your Profile",hasBack:true}
    },
    user: function() {
        return Meteor.user().profile;
    },
});
