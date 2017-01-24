
Template.documentEditSortable.viewmodel({
  headerVariable: function(){
    var agent = Agents.findOne({
        "_id": Router.current().params.agent_id
    });
    var title = "";
    var subtitle = "";
    if(agent){
      title = agent.name;
      var id = Router.current().params.type_id;
      if(id === "nodoctype")
        subtitle = "Editing uncategorized documents"
      else{
        var docType = DocumentTypes.findOne({_id:id});
        if(docType)
        subtitle = "Editing "+docType.name+" documents"
      }
    }
    return {title:title,subtitle:subtitle,hasBack:true};
  },
  agent_id: function(){
    return Router.current().params.agent_id;
  },
  headerRouteParams: function(){
    return {_id:this.agent_id()};
  },
  autorun: function(){
    this.templateInstance.subscribe("agent",Router.current().params.agent_id)
  },
  docType: function(){
    var id = Router.current().params.type_id;
    if(id === "nodoctype")
    return "Uncategorized"
    else{
      var docType = DocumentTypes.findOne({_id:id});
      if(docType)
      return docType.name
    }
  },
  agent: function() {
      return Agents.findOne({
          "_id": Router.current().params.agent_id
      });
  }
});
