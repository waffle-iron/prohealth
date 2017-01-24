Template.agentsAgentCard.viewmodel({

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
    randomPic: function() {
        var i = parseInt(Math.random() * 10000, 10);
        return 'https://graph.facebook.com/' + i + '/picture?type=large';
    },
    agent: function() {
        return Agents.findOne(this._id());
    },

    getJob: function() {
        return this.agent().job_name();
    },
    getPicture: function() {
        if (this.agent()) {
            if (this.agent().picture)
                return this.agent().picture.url;
            else
                return "/blank-avatar.png";
        } else
            return "/blank-avatar.png";
    },


});
