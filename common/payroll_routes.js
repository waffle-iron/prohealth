// if (Meteor.isClient) {
//     var userData = Meteor.subscribe("user");
//     Router.onBeforeAction(
//         function() {
//             if (userData.ready()) {
//                 if (Meteor.user()) {
//                     if (Meteor.user().hasRole('payroll-admin')) {
//                         this.next();
//                     } else {
//                         Router.go('/');
//                     }
//                 } else {
//                     // this.next();
//                     this.layout("loginLayout");
//                     this.render("login");
//                 }
//             } else {
//                 this.layout("layout");
//                 this.render("loading");
//             }
//         }, {
//             only: [
//                 'pendingTimesheet',
//                 'visits',
//                 'visitsSummaries',
//                 'visitsDuplicates',
//                 'visitsSpreadsheet',
//                 'visitsStats',
//                 'visitEdit',
//                 'visitDetails',
//                 'visitsScrapper',
//                 'agentVisitsSheet',
//                 'editRates',
//                 'accounts'
//             ]
//         }
//     );
//
//     Router.onBeforeAction(
//         function() {
//             if (userData.ready()) {
//                 if (Meteor.user()) {
//                     if (Meteor.user().hasRole('payroll') ||
//                         Meteor.user().hasRole('payroll-admin')) {
//                         this.next();
//                     } else {
//                         Router.go('/');
//                     }
//                 } else {
//                     this.layout("loginLayout");
//                     this.render("login");
//                 }
//             } else {
//
//                 this.layout("layout");
//                 this.render("loading");
//             }
//         }, {
//             only: [
//                 'timesheet',
//                 'accounts'
//             ]
//         }
//     );
// }
Router.route('/editRates', {
    name: 'editRates',
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#editRates").addClass('active');
        }, 100);
    },
});

Router.route('/timesheet/:_id?', {
    name: 'timesheet',
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#timesheet" + Router.current().params.query.billingState).addClass('active');
        }, 100);
    },
});

Router.route('/pendingTimesheet/:_id?', {
    name: 'pendingTimesheet',
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#pendingTimesheet").addClass('active');
        }, 100);
    },
});

Router.route('/agentVisitsSheet/', {
    name: 'agentVisitsSheet',
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#agentVisitsSheet").addClass('active');
        }, 100);
    },
});

Router.route('/visits', {
    name: "visits",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#visits").addClass('active');
        }, 100);
    },
});

Router.route('/visitsSummaries', {
    name: 'visitsSummaries'
});

Router.route('/visitsDuplicates', {
    name: "visitsDuplicates"
});

Router.route('/visitsSpreadsheet', {
    name: "visitsSpreadsheet",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#visitsSpreadsheet").addClass('active');
        }, 100);
    },
});

Router.route('/visitsStats', {
    name: "visitsStats",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#visitsStats").addClass('active');
        }, 100);
    },
});

Router.route('/visits/:_id/edit', {
    name: "visitEdit",

    data() {
        return Visits.findOne({
            _id: this.params._id
        });
    },

    action() {
        this.render('visit.edit');
    }
});

Router.route('/visits/:_id', {
    name: "visitDetails",
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#visits").addClass('active');
        }, 100);
    },
});

Router.route('/scrapper', {
    name: 'visitsScrapper',
    action() {
        this.render('visitsscrapper');
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#visitsScrapper").addClass('active');
        }, 100);
    },
});
