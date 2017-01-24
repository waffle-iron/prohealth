if (Meteor.isClient) {
    Router.configure({
        layoutTemplate: 'layout'
    });
    var userData = Meteor.subscribe("user");
    // Router.onBeforeAction(function() {
    //     if (userData.ready()) {
    //         if (!Meteor.user()) {
    //             this.layout("loginLayout");
    //             this.render("login");
    //         } else {
    //             this.next();
    //         }
    //     } else {
    //         // this.layout("layout");
    //         this.render("loading");
    //     }
    // }, {
    //     only: [
    //         '/',
    //         'accounts'
    //     ]
    // });

    Router.route("/", function() {
        if (userData.ready()) {
            if (Meteor.user()) {
                if (Meteor.user().hasRole('hr')) {
                    Router.go('agents');
                } else if (Meteor.user().hasRole('hr-admin')) {
                    Router.go('agents');
                } else if (Meteor.user().hasRole('billing')) {
                    Router.go('bills');
                } else if (Meteor.user().hasRole('billing-admin')) {
                    Router.go('bills');
                } else if (Meteor.user().hasRole('sales')) {
                    Router.go('patients');
                } else if (Meteor.user().hasRole('sales-admin')) {
                    Router.go('patients');
                } else if (Meteor.user().hasRole('payroll')) {
                    Router.go('timesheet', {}, {
                        query: 'billingState=logged'
                    });
                } else if (Meteor.user().hasRole('payroll-admin')) {
                    Router.go('pendingTimesheet', {}, {
                        query: 'billingState=pending'
                    });
                } else {
                    Router.go("notFound");
                }
            } else {
                this.layout("loginLayout");
                this.render("login");
            }
        } else {
            // this.layout("loginLayout");
            this.render("loading");
        }
    });


    Router.route('/accounts', {
        name: 'accounts',
        action() {
            if (this.ready()) {
                this.render();
            } else {
                this.render('loading');
            }
        }
    });
    // Router.route('/notFound', {
    //   name: 'notFound',
    // });

    // Router.route('/marketerReport/:marketer', function(){
    //   this.render('marketerReportMainPage');
    // });


    Router.route("/accounts/:_id/edit", {
        name: "accountsEdit"
    });
}
if (Meteor.isServer) {
    JsonRoutes.add("get", "/allpatients", function(req, res, next) {
        JsonRoutes.sendResult(res, {
            data: Patients.find({}).fetch()
        });
    });
}
