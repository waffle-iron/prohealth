// if (Meteor.isClient) {
//     var userData = Meteor.subscribe("user");
//     Router.onBeforeAction(
//         function() {
//             if (userData.ready()) {
//                 if (Meteor.user()) {
//                     // console.log(Meteor.user());
//                     if (Meteor.user().hasRole('hr') || Meteor.user().hasRole('hr-admin')) {
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
//                 'agents',
//                 'profile',
//                 'changePassword',
//                 'accounts'
//             ]
//         }
//     );
//
//     Router.onBeforeAction(
//         function() {
//             if (userData.ready()) {
//                 if (Meteor.user()) {
//                     if (Meteor.user().hasRole('hr-admin')) {
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
//                 'agentEdit',
//                 'agentCreate',
//                 'documentEdit',
//                 'documentEditSortable',
//                 'documentDelete',
//                 'missingDocuments',
//                 'expiringDocuments',
//                 'emergencyList',
//                 'rateDelete',
//                 'jobs',
//                 'editjob',
//                 'createjob',
//                 'rateEdit',
//                 'accounts'
//             ]
//         }
//     );
// }
Router.route('/agents', {
    name: 'agents',
    subscriptions: function() {
        return [Meteor.subscribe("agencies"),
            Meteor.subscribe("areas"),
            Meteor.subscribe("availabilities"),
            Meteor.subscribe("jobs")
        ];
    },
    action: function() {
        this.render("loading");
        if (this.ready()) {
            this.render();
        }
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#agents").addClass('active');
        }, 100);
    },
});

Router.route('/user/changePassword', {
    name: 'changePassword',
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#agents").addClass('active');
        }, 100);
    },
});

Router.route('/agents/:_id/edit', {
    name: 'agentEdit',


    action: function() {
        if (this.ready()) {
            this.render();
        } else {
            this.render('Loading');
        }
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#agents").addClass('active');
        }, 100);
    },
});

Router.route('/agents/create', {
    name: 'agentCreate',
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#agents").addClass('active');
        }, 100);
    },
});

Router.route('/agent/:_id/profile', {
    name: 'profile',
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#agents").addClass('active');
        }, 100);
    },
});

Router.route('/documents/:agent_id?/:document_type_id?/edit', {
    name: 'documentEdit',
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#agents").addClass('active');
        }, 100);
    },
});

Router.route('/documents/:agent_id?/:type_id?/editSortable', {
    name: 'documentEditSortable',
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#agents").addClass('active');
        }, 100);
    },
});

Router.route('/documents/:_id/delete', {
    name: 'documentDelete',
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#agents").addClass('active');
        }, 100);
    },
});

Router.route("/missingDocuments", {
    name: "missingDocuments",
    subscriptions() {
        return [Meteor.subscribe("agencies"),
            Meteor.subscribe("areas"),
            Meteor.subscribe("availabilities"),
            Meteor.subscribe("jobs")
        ];
    },
    action() {
        this.render("loading");
        if (this.ready()) {
            this.render();
        }
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#missingDocuments").addClass('active');
        }, 100);
    },
});

Router.route("/expiringDocuments", {
    name: "expiringDocuments",
    subscriptions() {
        return [Meteor.subscribe("agencies"),
            Meteor.subscribe("areas"),
            Meteor.subscribe("availabilities"),
            Meteor.subscribe("jobs")
        ];
    },
    action() {
        this.render("loading");
        if (this.ready()) {
            this.render();
        }
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#expiringDocuments").addClass('active');
        }, 100);
    },
});

Router.route('/emergencylist', {
    name: 'emergencyList',
    subscriptions() {
        return [Meteor.subscribe("agencies"),
            Meteor.subscribe("areas"),
            Meteor.subscribe("availabilities"),
            Meteor.subscribe("jobs")
        ];
    },
    action() {
        this.render("loading");
        if (this.ready()) {
            this.render();
        }
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#emergencyList").addClass('active');
        }, 100);
    },
});

Router.route('/rates/:_id/delete', {
    name: 'rateDelete',
});

Router.route('/rates/:_id/edit', {
    name: 'rateEdit',
});

Router.route('/jobs', {
    name: 'jobs',
    subscriptions() {
        return Meteor.subscribe("jobs");
    },
    action() {
        this.render("loading");
        if (this.ready()) {
            this.render();
        }
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#jobs").addClass('active');
        }, 100);
    },
});

Router.route('/jobs/:_id/edit', {
    name: 'editjob',
    data() {
        return Jobs.findOne({
            _id: this.params._id
        });
    },
    action() {
        this.render();
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#jobs").addClass('active');
        }, 100);
    },
});

Router.route('/jobs/new', {
    name: 'createjob',
    action() {
        this.render();
    },
    onAfterAction: function() {
        setTimeout(function() {
            $('li').removeClass('active');
            $("li#jobs").addClass('active');
        }, 100);
    },
});
