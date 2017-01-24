
Template.header.viewmodel({
  title: function(){
    return this.headerVariable().title;
  },
  subtitle: function(){
    return this.headerVariable().subtitle;
  },
  hasBack: function(){
    return this.headerVariable().hasBack;
  },
  events:{
    'click .back': function(){
      if(this.backRoute){
        if(this.params){
          Router.go(this.backRoute(),this.params());
        }
        else{
          Router.go(this.backRoute());
        }
      }
      else {
        history.back();
      }
    }
  }
});
