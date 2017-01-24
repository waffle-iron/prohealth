// if (Meteor.isClient) {
//     var userData = Meteor.subscribe("user");
//     Router.onBeforeAction(
//         function() {
//             if (userData.ready()) {
//                 if (Meteor.user()) {
//                     // console.log(Meteor.user());
//                     if (Meteor.user().hasRole('billing') ||
//                         Meteor.user().hasRole('billing-admin')) {
//                         this.next();
//                     } else {
//                         Router.go('/');
//                     }
//                 } else {
//                     this.layout("loginLayout");
//                     this.render("login");
//                 }
//             } else {
//                 this.layout("layout");
//                 this.render("loading");
//             }
//         }, {
//             only: [
//                 'bills',
//                 'billCreate',
//                 'billEdit',
//                 'billDelete',
//                 'reportsBillsSummary',
//                 'reportsPaymentsSummary',
//                 'reportsRecievablesSummary',
//                 'billsSpreadsheet',
//                 'recievablesSpreadsheet',
//                 'followups',
//                 'billLogs',
//                 'billsStats',
//                 'payments',
//                 'accounts'
//             ]
//         }
//     );
// }

Router.route("/bills/:_id/edit", {
    name: "billEdit",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#bills").addClass('active');
        }, 100);
    },
});

Router.route("/bills/:_id/delete", {
    name: "billDelete",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#bills").addClass('active');
        }, 100);
    },
});

Router.route("/bills/create", {
    name: "billCreate",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#bills").addClass('active');
        }, 100);
    },
});

Router.route("/bills", {
    name: "bills",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#bills").addClass('active');
        }, 100);
    },
});

Router.route("/bills/reports", {
    name: "reportsBillsSummary",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#reportsBillsSummary").addClass('active');
        }, 100);
    },
});

Router.route("/bills/payments_summary", {
    name: "reportsPaymentsSummary",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#reportsPaymentsSummary").addClass('active');
        }, 100);
    },
});

Router.route("/bills/receivables", {
    name: "reportsRecievablesSummary"
});

Router.route('/billsSpreadsheet', {
    name: "billsSpreadsheet"
});

Router.route('/recievablesSpreadsheet', {
    name: "recievablesSpreadsheet",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#recievablesSpreadsheet").addClass('active');
        }, 100);
    },
});

Router.route("/followups", {
    name: "followups",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#followups").addClass('active');
        }, 100);
    },
});

Router.route("/billlogs", {
    name: "billLogs",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#billLogs").addClass('active');
        }, 100);
    },
});

Router.route('/billsStats', {
    name: "billsStats",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#billsStats").addClass('active');
        }, 100);
    },
});

Router.route("/payments", {
    name: "payments",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#payments").addClass('active');
        }, 100);
    },
});


Router.route("/migrate", {
    name: "migrate",
    onAfterAction: function() {
        setTimeout(function() {
            // $('li').removeClass('active');
            // $("li#payments").addClass('active');
        }, 100);
    },
});
