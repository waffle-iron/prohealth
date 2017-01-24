import ProhealthConnection from './scrapper/prohealthConnection.js';
import VisitsValidator from './scrapper/visitsValidator.js';

Meteor.publish("visits-stats", function(fromDate, toDate) {
    ReactiveAggregate(
        this,
        Visits, [{
                $match: {
                    formDate: {
                        $gte: moment(fromDate)._d,
                        $lte: moment(toDate)._d
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y/%m/%d",
                            date: "$formDate"
                        }
                    },
                    y: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ], {
            clientCollection: 'visits-stats'
        }
    );
});


Meteor.publish("pendingVisits", function() {
    return Visits.find({
        billingState: {
            $in: ["pending", "rejected", "approved"]
        }
    });
});

Meteor.publish("visits-aggregates", function(query, field, self, formStatuses) {
    let _id = field;
    if (_id == "$formDate") {
        _id = {
            $dateToString: {
                format: "%m/%d/%Y",
                date: "$formDate"
            }
        };
    }

    if (self) {
        if (this.userId) {
            query["user"] = Meteor.users.findOne(this.userId).profile.name;
        }
    }

    if (formStatuses) {
        query["formStatus"] = {
            $in: formStatuses
        };
    }

    ReactiveAggregate(
        this,
        Visits, [{
                $match: query
            },
            {
                $group: {
                    _id: {
                        "$ifNull": [_id, "Undefined"]
                    },
                    visits: {
                        $push: {
                            _id: "$_id",
                            formStatus: "$formStatus",
                            patient: "$patient",
                            timeIn: "$timeIn",
                            timeOut: "$timeOut",
                            formDate: "$formDate",
                            user: "$user",
                            form: "$form",
                            billingState: "$billingState"
                        }
                    },
                    total: {
                        $sum: 1
                    },
                    cost: {
                        $sum: "$cost"
                    }
                }
            }
        ], {
            clientCollection: "visits-aggregates"
        }
    );
});

Meteor.publish("visits-admin-aggregates", function(query, field, self) {
    var _id = field;

    if (_id == "$formDate")
        _id = {
            $dateToString: {
                format: "%m/%d/%Y",
                date: "$formDate"
            }
        };

    if (self)
        query["user"] = Meteor.users.findOne(this.userId).profile.name;
    ReactiveAggregate(this, Visits, [{
        $match: query
    }, {
        $group: {
            _id: _id,
            visits: {
                $push: {
                    _id: "$_id",
                    patient: "$patient",
                    timeIn: "$timeIn",
                    timeOut: "$timeOut",
                    formDate: "$formDate",
                    user: "$user",
                    form: "$form",
                    billingState: "$billingState"
                }
            },
            total: {
                $sum: 1
            },
            cost: {
                $sum: "$cost"
            }
        }
    }], {
        clientCollection: "visits-admin-aggregates"
    });
});
//================================================================
// aggregation for visits/agent report
Meteor.publish("agent-visit-aggregates", function(query) {
    var _id = "$user";
    var q = {};
    if (query) {
        q = query
    }
    // if(users.length>0){
    //   if(users.length>0)
    //     q["user"] = {$in: users}
    // }
    // else{
    //   return;
    // }
    // console.log(q);
    ReactiveAggregate(this, Visits, [{
            $match: q
        },
        {
            $project: {
                user: true,
                form: true,
                billingState: true,
                complex: true,
                out_of_area: true,
                mileage: true,
                cost: true,
                nonRegular: {
                    $or: [{
                            $eq: ["$complex", true]
                        },
                        {
                            $eq: ["$out_of_area", true]
                        },
                    ]
                },
                regular: {
                    $and: [{
                            $ne: ["$complex", true]
                        },
                        {
                            $ne: ["$out_of_area", true]
                        },
                    ]
                },
            }
        },
        {
            $group: {
                _id: _id,
                visits: {
                    $push: {
                        _id: "$_id",
                        user: "$user",
                        form: "$form",
                    },
                },
                nonRegular: {
                    $sum: {
                        $cond: ["$nonRegular", 1, 0]
                    }
                },
                nonRegularCost: {
                    $sum: {
                        $cond: ["$nonRegular", "$cost", 0]
                    }
                },

                regular: {
                    $sum: {
                        $cond: ["$regular", 1, 0]
                    }
                },
                regularCost: {
                    $sum: {
                        $cond: ["$regular", "$cost", 0]
                    }
                },

                total: {
                    $sum: 1
                },
                cost: {
                    $sum: "$cost"
                }
            }
        },
        {
            $sort: {
                nonRegular: -1
            }
        }
    ], {
        clientCollection: "agent-visit-aggregates"
    });
});
//================================================================

// Meteor.publish("usersNames", function(userId) {
//     return Meteor.users.find({}, {
//         fields: {
//             '_id': 1,
//             'profile.name': 1
//         }
//     });
// });

// Meteor.publish('visits-settings', function(fields) {
//     return VisitsSettings.find({
//         key: {
//             $in: fields
//         }
//     });
// });

let loginParams = {
    username: "mohamed.b",
    password: "123456789",
    site: "prohealth",
    action: "login",
};
let myConn = new ProhealthConnection(loginParams);

Meteor.methods({
    'updateVisitsCost' (name) {
        var trimmedName = name.replace(/\((.*?)\)/, "").trim();
        var capitalizedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);
        var agent = Agents.findOne({
            "name": capitalizedName
        });
        // UPDATING ONLY LOGGED VISITS
        var visits = Visits.find({
            user: name,
            formStatus: {
                $in: ["Completed", "Sent To Office", "Corrected"]
            },
            billingState: "logged"
        }).fetch();

        _.each(visits, function(visit) {
            // console.log(visit.form);
            var type = CompensationTypes.findOne({
                "name": visit.form
            });
            if (type) {
                if (agent) {
                    var rate = CompensationRates.findOne({
                        "compensation_type": type._id,
                        "agent": agent._id
                    });
                    var cost = 0;
                    if (rate) {
                        cost = rate.amount;
                    }

                    if (visit.complex) {
                        var rate = CompensationTypes.findOne({
                            "name": "Complex"
                        });
                        if (rate) {
                            var comp_rate = CompensationRates.findOne({
                                "compensation_type": rate._id
                            });
                            if (comp_rate)
                                cost += comp_rate.amount;
                        }
                    }
                    if (visit.out_of_area) {
                        var rate = CompensationTypes.findOne({
                            "name": "Out of area"
                        });
                        if (rate) {
                            var comp_rate = CompensationRates.findOne({
                                "compensation_type": rate._id
                            });
                            if (comp_rate)
                                cost += comp_rate.amount;
                        }
                    }
                    if (visit.mileage > 0) {
                        var rate = CompensationTypes.findOne({
                            "name": "Mileage"
                        });
                        if (rate) {
                            var comp_rate = CompensationRates.findOne({
                                "compensation_type": rate._id
                            });
                            if (comp_rate)
                                cost += (comp_rate.amount * visit.mileage);
                        }
                    }

                    Visits.update({
                        _id: visit._id
                    }, {
                        $set: {
                            cost: cost
                        }
                    })
                }
            }
        });
        return true;
    },
    'getSupervisedAgentNames' (agent) {
        var admin = agent;
        var supervisor = Agents.findOne({
            name: admin
        });
        if (supervisor)
            supervisor = supervisor._id
        else {
            return []
        }
        var supervisedAgents = Agents.find({
            supervisor: supervisor
        }).fetch();
        // console.log(supervisedAgents);
        agentNames = supervisedAgents.map(function(agent) {
            return agent.name
        });
        // console.log(agentNames);
        let names = [];
        agentNames.forEach(function(name) {
            name = name.substring(name.indexOf("-"))
            if (Visits.findOne({
                    "user": {
                        $regex: ".*" + name + ".*"
                    }
                }))
                names.push({
                    name: Visits.findOne({
                        "user": {
                            $regex: ".*" + name + ".*"
                        }
                    }).user,
                    hasVisits: true
                })
            else
                names.push({
                    name: name,
                    hasVisits: false
                });
        });
        // console.log(names);
        return names
    },

    'visits.update' (startDate, endDate, maxResults = 10000) {
        console.log("load");
        let visitsStatus = new VisitsValidator(startDate, endDate, "any", true, 1, myConn);
        myConn.start();
        if (myConn.status) {
            console.log("Connected");
            visitsStatus.getVisits(maxResults);

            return true;
        } else {
            console.log("still connecting..");
        }
    },


    'visits.aggregate' (query, _id) {
        let result = Visits.aggregate([{
            $match: query
        }, {
            $group: {
                _id,
                total: {
                    $sum: 1
                }
            }
        }, {
            $sort: {
                _id: -1
            }
        }, ]);
        return result;
    },

    'visits.request' (field, value, state) {
        let name = Meteor.users.findOne(this.userId).profile.name;
        let query = {};
        query[field] = value;
        if (field == "formDate")
            query[field] = {
                $gte: moment(value).startOf('day')._d,
                $lte: moment(value).endOf('day')._d
            };
        query["user"] = name;
        query["billingState"] = "logged";
        _.each(Visits.find(query).fetch(), function(visit) {
            if (visit && (visit.complex || visit.out_of_area || visit.mileage > 0.05)) {
                state = "pending";
            } else {
                state = "approved";
            }
            Visits.update(visit._id, {
                $set: {
                    billingState: state
                }
            });
        });
    },
    'timesheet.request' (state) {
        let name = Meteor.users.findOne(this.userId).profile.name;
        let query = {};
        // query[field] = value;
        // if (field == "formDate")
        //     query[field] = {
        //         $gte: moment(value).startOf('day')._d,
        //         $lte: moment(value).endOf('day')._d
        //     };
        query["user"] = name;
        query["billingState"] = "logged";
        _.each(Visits.find(query).fetch(), function(visit) {
            if (visit && (visit.complex || visit.out_of_area || visit.mileage > 0.05)) {
                state = "pending";
            } else {
                state = "approved";
            }
            Visits.update(visit._id, {
                $set: {
                    billingState: state
                }
            });
        });
        return true;
    },
    'undo' () {
        let name = Meteor.users.findOne(this.userId).profile.name;
        let query = {};
        query["user"] = name;
        query["billingState"] = {
            $in: ["approved", "pending"]
        };
        _.each(Visits.find(query).fetch(), function(visit) {
            state = "logged";
            Visits.update(visit._id, {
                $set: {
                    billingState: state
                }
            });
        });
    },
    'visits.update.state' (field, value, state) {
        // console.log("here");
        // console.log(state);
        let query = {};
        query[field] = {
            $gte: moment(value).startOf('day')._d,
            $lte: moment(value).endOf('day')._d
        };;
        query["billingState"] = "pending";
        // console.log(Visits.find(query).fetch());
        _.each(Visits.find(query).fetch(), function(visit) {
            console.log("here");
            Visits.update(visit._id, {
                $set: {
                    billingState: state
                }
            });
        });
    }
});
