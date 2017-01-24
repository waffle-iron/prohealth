Template.emailModal.viewmodel({
  getUserEmail(){
    let email = Meteor.users.findOne({_id: Meteor.userId()}).emails[0].address;
    return email;
  },
  // subject: "report",
  // filters: "date",
  events: {
    'click #sendemail'(event){
      event.preventDefault();
      let valid = true;
      let to = $("#recepient").val();
      let emailsList = to.split(',');
      _.each(emailsList, function(email){
        if(! emailRegEx.test(email.trim())){
          valid = false;
        }
      });
      if(!valid){
        $("emailError").show()
        Materialize.toast('Invalid E-mail/s', 2000, 'rounded red lighten-2');
        $("#to").focus();
        return;
      }
      else{
        $("emailError").hide()
        _this = this;
        let from = this.getUserEmail();
        // TODO: send subject as template variable
        let subject = this.subject();
        // console.log(content);
        Meteor.call('sendemail',to, from, subject,this.repData(), function(err, res){
          if(!err){
            Materialize.toast('Email Sent Successfully', 2000, 'rounded green lighten-2');
          }
          else {
            Materialize.toast(err.message, 4000, 'rounded red lighten-2');
            $("#send-content").remove();
          }
        });
        $('#modal1').closeModal();
      }
    }
  }
});

let emailRegEx = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([a-z][a-z]+)|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
