// if (Meteor.isClient) {
//     var userData = Meteor.subscribe("user");
//     Router.onBeforeAction(
//         function() {
//             if (userData.ready()) {
//                 if (Meteor.user()) {
//                     if (Meteor.user().hasRole('sales-admin') ||
//                         Meteor.user().hasRole('sales')) {
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
//                 'patients',
//                 'patientsSummaries',
//                 'patientsSpreadsheet',
//                 'patientsSpreadsheetGrouped',
//                 'patientsReferrals',
//                 'patientsStats',
//                 'marketerSales',
//                 'accounts'
//             ]
//         }
//     );
// }
Router.route('/patients', {
    name: 'patients',
    action() {
        if (this.ready()) {
            this.render();
        } else {
            this.render('loading');
        }
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#patients").addClass('active');
        }, 100);
    },
});

Router.route('/patientsSummaries', {
    name: 'patientsSummaries',
    action() {
        if (this.ready()) {
            this.render();
        } else {
            this.render('loading');
        }
    }
});

Router.route('/patientsSpreadsheet', {
    name: 'patientsSpreadsheet',
    action() {
        if (this.ready()) {
            this.render();
        } else {
            this.render('loading');
        }
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#patientsSpreadsheet" + Router.current().params.query.type).addClass('active');
        }, 100);
    },
});

Router.route('/patientsSpreadsheetGrouped', {
    name: 'patientsSpreadsheetGrouped',
    action() {
        if (this.ready()) {
            this.render();
        } else {
            this.render('loading');
        }
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#patientsSpreadsheetGrouped" + Router.current().params.query.type).addClass('active');
        }, 100);
    },
});

Router.route('/patientsReferrals', {
    name: 'patientsReferrals'
});

Router.route('/patientsStats', {
    name: "patientsStats",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#patientsStats").addClass('active');
        }, 100);
    },
});

Router.route('/marketerSales/:template/:marketer?', {
    name: "marketerSales",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#marketerSales").addClass('active');
        }, 100);
    },
});
