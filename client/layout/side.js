import YAY from "./vendor/yay.js"

Template.side.viewmodel({
  agent: function(){
    return Meteor.user();
  },
  autorun: function(){
    if(Meteor.user()){
      Meteor.subscribe("agentByName", Meteor.user().profile.name.replace(/\((.*?)\)/,"").trim());
    }
  },
  agentId: function(){
    if(Meteor.user()){
      // console.log(Meteor.user().profile.name.replace(/\((.*?)\)/,"").trim());
      var agent = Agents.findOne({name: Meteor.user().profile.name.replace(/\((.*?)\)/,"").trim()});
      if (agent) {
        return agent._id;
      }
    }
  },
  selected(){
    $('li').removeClass('active');
    $(this).addClass('active');
  },
  agentPictureURL: function(){
    if(Meteor.user() && Meteor.user().profile){
      if(Agents.findOne(Meteor.user().profile.agent)){
      var agent = Agents.findOne(Meteor.user().profile.agent);
      if(agent){
        if(agent.picture && agent.picture.url){
          return agent.picture.url;
        } else{
          return "/blank-avatar.png";
        }
      } else{
        return "/blank-avatar.png";
      }
    }else{
      return "/blank-avatar.png";
    }
    }else{
      return "/blank-avatar.png";
    }
  },

  agentName: function(){
    if(Meteor.user() && Meteor.user().profile){
      if(Agents.findOne(Meteor.user().profile.agent))
      return Agents.findOne(Meteor.user().profile.agent).name;
      else {
        return Meteor.user().profile.name;
      }
    }
    else{
      if(Meteor.user()){
        return Meteor.user().profile.name;
      }
      else{
        return "N/A";
      }
    }
  },

  agentJob: function(){
    if(Meteor.user() && Meteor.user().profile){
      if(Agents.findOne(Meteor.user().profile.agent))
      return Agents.findOne(Meteor.user().profile.agent).job_name();
      else {
        return "Unassigned";
      }
    }
    return "Unassigned";
  },

  isAgent: function(){
    if(Meteor.user() && Meteor.user().profile){
      if(Meteor.user() && Meteor.user().profile.agent)
        return true;
    }
    return false;
  },

  hasRole: function(roles){
    let rolesArray = roles.split(', ');
    let hasThisRole = false;
    _.each(rolesArray, function(role){
      if(Roles.userHasRole(Meteor.userId(), role)){
        hasThisRole = true;
      }
    });
    return hasThisRole;
  },

  notDocumentsRoute: function(){
    return !Router.current().url.includes("editSortable")
  },

  onRendered: function(){
    // Session.get("selectedTab");
    $('.yaybar').each(function() {
      var options = $.extend({}, YAY.DEFAULTS, $(this).data(), typeof option == 'object' && option);
      var curyay = new YAY(this, options);
    });
    $(".nano").nanoScroller();
    // $('li').removeClass('active');
    // $("li#"+localStorage.getItem("selectedTab")).addClass('active');
    // console.log(localStorage.getItem("selectedTab"));
  }
});

Template.side.events({
  'click .logout'(event){
    event.preventDefault();
    Meteor.logout();
  },
  "click .sidebar-item"(event){
    // console.log(event.target);
    // Session.set("selectedTab",event.target.id);
    // localStorage.setItem("selectedTab",event.target.id);
    // $('li').removeClass('active');
    // $("li#"+event.target.id).addClass('active');
  }
});
