Template.billDelete.viewmodel({
  headerVariable:{title:"Delete Bill",subtitle:"Bill delete confirmation",hasBack:false},
  bill: function(){
    // console.log(Bills.findOne(Router.current().params._id).patient());
    return Bills.findOne(Router.current().params._id);
  },
  billDate(date){
    return moment(date).format("MM/DD/YYYY")
  },
  events: {
      'click .delete': function(){
        var id = Router.current().params._id;
        Bills.remove({_id:id});
        history.back();
      },
      'click .cancel': function(){
        history.back();
      }
  }
});
