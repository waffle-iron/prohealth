
Template.agents.viewmodel({
  headerVariable:{title:"People",subtitle:"List of all system users",hasBack:false},
  hasRole: function(roles) {
    let rolesArray = roles.split(', ');
    let hasThisRole = false;
    _.each(rolesArray, function(role){
      if(Roles.userHasRole(Meteor.userId(), role)){
        hasThisRole = true;
      }
    });
    return hasThisRole;
  },
  randomPic: function(){
    var i = parseInt(Math.random()*10000, 10);
    return 'https://graph.facebook.com/'+i +'/picture?type=large';
  },
  onCreated: function(){
    $("ul.pagination  li").addClass("waves-effect");
  },
  onRendered:function(){
      $("ul.pagination li").addClass("waves-effect");
  },
  autorun(){
    var subscription = this.templateInstance.subscribe("agents", Session.get("agentsFilter"));
  }
});


Template.agentsList.viewmodel({
  agents: function(){
    return Agents.find(Session.get("agentsFilter")).fetch();
  },
  hasEntries: Session.get("filterHasEntries"),
  filterHasEntries: function(){
    return this.hasEntries(Session.get("filterHasEntries"));
  }
});
