
Template.profile.viewmodel({
  headerVariable:{title:"Profile",subtitle:"Viewing agent profile",hasBack:true},
    autorun: function(){
      this.templateInstance.subscribe("agent",Router.current().params._id);
      this.templateInstance.subscribe("agentRates",Router.current().params._id);
      this.templateInstance.subscribe("agentDocuments",Router.current().params._id);
    },
    user: function() {
        return Meteor.user().profile;
    },
    hasRole: function(role) {
        return Roles.userHasRole(Meteor.userId(), "hr-admin");
    },
    agent: function() {
        return Agents.findOne({
            _id: Router.current().params._id
        });

    },
    agentPictureURL: function() {
        if (this.agent()) {
            if (this.agent().picture) {
                return this.agent().picture.url;
            } else {
                return "/blank-avatar.png";
            }
        } else {
            return "/blank-avatar.png";
        }
    },

    rates: function() {
      if(this.agent()){
        if (CompensationRates.find({
                agent: this.agent()._id
            }).fetch().length) {
            return CompensationRates.find({
                agent: this.agent()._id
            });
          }
        } else {
            return false;
        }
    },
    documents: function() {
      if(this.agent()){
        if (Documents.find({
                agent: this.agent()._id
            }).fetch().length) {
            return Documents.find({
                agent: this.agent()._id
            });
        }
      } else {
        return false;
      }
    },
    display_date: function(date) {
        return moment(date).format("LL");
    },
    rate: function(amount) {
        return accounting.formatMoney(amount);
    },
    isOwner: function() {
        if(Meteor.user()){
          var agent = Agents.findOne({name: Meteor.user().profile.name.replace(/\((.*?)\)/,"").trim()});
          if (agent && this.agent()) {
            if (agent._id == this.agent()._id) {
                return true;
            }
          }
        }
        return false;
    },
    isHrOrOwner: function() {
        if (this.isHr() || this.isOwner()) {
            return true;
        }
        return false;
    },
    isHr: function() {
      console.log(Roles.userHasRole(Meteor.userId(), "hr-admin"));
        if (Roles.userHasRole(Meteor.userId(), "hr-admin")) {
            return true;
        }
        return false;
    },
});
