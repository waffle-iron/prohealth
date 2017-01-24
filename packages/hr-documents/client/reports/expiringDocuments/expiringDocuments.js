import expDocs from './pubExpiredDocuments';
Template.expiringDocuments.viewmodel({
  headerVariable:{title:"Expiring Documents",subtitle:"All documents expiring soon",hasBack:false},
    agents: function() {
        return Agents.find().fetch();
    },

    expiringDocumentsAggr: function() {
        return Session.get("expDocsExist");

    },
    onRendered: function() {
        if(Session.get("expiresIn")){
          this.expiresIn(Session.get("expiresIn"));
          if(Session.get("expiresIn")==0)
          $(".expiry input").val("Expired");
          else if(Session.get("expiresIn")==30 || Session.get("expiresIn")==60)
          $(".expiry input").val(Session.get("expiresIn")+" days");
        }
    },
    agentsWithExpiringDocuments: function() {
      let agent_ids = [];
      expDocs.find({}).forEach(function(doc) {
          agent_ids.push(doc._id);
      });
      return agent_ids;
    },
    expiresIn: "",
    currentFilter:{},
    autorun(){
      var instance = this.templateInstance;
      var expires = this.expiresIn();
      Session.set("expiresIn",expires);
      var rangeEnd = moment().add(expires, 'days');
      var rangeStart = moment().add(expires - 30 , 'days');
      var query = {};
      // console.log(expires);
      if (expires === "0") {
          query = {
              expires: {
                  $lte: new Date(rangeEnd)
              }
          };
          instance.subscribe('expiringDocs', query);

      } else if(expires==""){

      } else{
          query = {
              $and: [{
                  expires: {
                      $lte: new Date(rangeEnd)
                  }
              }, {
                  expires: {
                      $gt: new Date(rangeStart)
                  }
              }]
          };
          instance.subscribe('expiringDocs', query);
      }
      if(expDocs.find().fetch().length>0){
        Session.set("expDocsExist",true);
      }
      else{
        Session.set("expDocsExist",false);
      }
      Session.set("expiresIn",expires);

      var agentsWExp = this.agentsWithExpiringDocuments();
      let currentFilter = Session.get("agentsFilter")
      currentFilter._id = { $in: agentsWExp }

      if(agentsWExp.length<=0){
        currentFilter._id = {
              $in: [-1]
          };
      }

      // console.log(currentFilter);
      this.currentFilter(currentFilter);
      this.templateInstance.subscribe("agents", currentFilter);
    }
});

Template.expiringDocumentsList.viewmodel({
  docs: function() {
      return expDocs.find().fetch();
  },
  agents: function() {
      return Agents.find(this.parent().currentFilter()).fetch();
  },
});
