Template.accounts.viewmodel({
  headerVariable:{title:"User Accounts",subtitle:"Editing user accounts and roles",hasBack:true},
  table: function(){
    return TabularTables.myAccounts;
  },
  onRendered(){
    setTimeout(function () {
      $(".dataTables_length label select").toggleClass("browser-default");
      $(".dataTables_length label select").css("width","auto");
      $(".dataTables_length label select").css("display","inline-block");
    }, 100);
  },
});

Template.editOption.events({
    'click .check-out': function() {
        Router.go("accountsEdit", { "_id": this._id })
    }
});
