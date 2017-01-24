Template.documentDelete.viewmodel({
  onCreated(){
    this.templateInstance.subscribe("document", Router.current().params._id);
  },
  document: function() {
      return Documents.findOne({
          "_id": Router.current().params._id
      });
  },
  agent: function() {
    this.templateInstance.subscribe("agent", this.document().agent);
      return Agents.findOne({
          "_id": this.document().agent
      });
  },
  events: {

      'click .delete': function(){
        var id = Router.current().params._id;
        Documents.remove({_id: id});
        history.back();


      },
      'click .cancel': function(){
        // Documents.remove(Router.current().params._id);
        history.back();
      }
  }
});
