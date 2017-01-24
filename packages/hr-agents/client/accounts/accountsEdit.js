    Template.accountsEdit.viewmodel({
        headerVariable:{title:"User Account",subtitle:"Editing user account and roles",hasBack:true},
        currentUser: '',
        emails: '',
        userName: '',
        roles: '',

        onCreated: function() {
            var that = this;
            Meteor.call("allUsers", Router.current().params._id, function(error, data) {
                that.emails(data[0].emails[0].address);
                that.userName(data[0].profile.name);
                that.currentUser(data[0]);
            });

            Meteor.call("roles", function(error, data) {
                that.roles(data);
            });
        },

        getCheckedRules: function() {
            var checkedValues = [];
            _.each(this.roles(), function(currentRole) {
                if (document.getElementById("input-role-" + currentRole).checked) {
                    checkedValues.push(currentRole);
                }
            })

            return checkedValues;
        },

        onRendered: function() {
            var that = this;
            setTimeout(function() {
                _.each(that.currentUser().roles, function(currentRole) {
                    document.getElementById("input-role-" + currentRole).checked = true;
                })
            }, 500);
        },


        events: {
            'submit #accountsUpdateProfileForm': function(event) {
                event.preventDefault(); //prevent form to change URL
                var form = event.target; //this is the .add-product-form element
                Meteor.users.update({ '_id': Router.current().params._id }, {
                    $set: {
                        'profile.name': form['profile.name'].value,
                        'roles': this.getCheckedRules(),
                        'emails.0.address': form['emails.0.address'].value
                    }
                });
            },
            'click .savePassword': function(){
              Meteor.call("changepassword",this.currentUser(),$("#passwordField").val(), function(error, result){
                if(!error){
                  Materialize.toast('Password updated successfully!', 4000, "green")
                }
              });
            }
        },

    });

    ;
