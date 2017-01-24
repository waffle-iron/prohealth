Meteor.publish("bills-spreadsheet", function(fromDate, toDate, field1, field2) {
    console.log(fromDate, toDate, field1, field2);
    let match = {
        [field1.substr(1)]: {
            $ne: null
        },
        [field2.substr(1)]: {
            $ne: null
        },
        date: {
            $gte: moment(fromDate, "MM/DD/YYYY").utc().toDate(),
            $lte: moment(toDate, "MM/DD/YYYY").utc().toDate()
        }
    };
    console.log(match);
    let project = {
        [field1.substr(1)]: true,
        [field2.substr(1)]: true,
        amount: true,
        day: {
            $and: [{
                    $gte: ['$date', moment(toDate, "MM/DD/YYYY").utc().startOf('day').toDate()]
                },
                {
                    $lte: ['$date', moment(toDate, "MM/DD/YYYY").utc().endOf('day').toDate()]
                }
            ]
        },
        week: {
            $and: [{
                    $gte: ['$date', moment(toDate, "MM/DD/YYYY").utc().startOf('week').toDate()]
                },
                {
                    $lte: ['$date', moment(toDate, "MM/DD/YYYY").utc().endOf('week').toDate()]
                }
            ]
        }
    };
    console.log(project);
    ReactiveAggregate(this,
        Bills, [{
                $match: match
            },
            {
                $project: project
            },
            {
                $group: {
                    _id: {
                        field1,
                        field2
                    },
                    days: {
                        $sum: {
                            $cond: ['$day', 1, 0]
                        }
                    },
                    weeks: {
                        $sum: {
                            $cond: ['$week', 1, 0]
                        }
                    },
                    months: {
                        $sum: 1
                    },
                    daysTotal: {
                        $sum: {
                            $cond: ["$day", "$amount", 0]
                        }
                    },
                    weeksTotal: {
                        $sum: {
                            $cond: ["$week", "$amount", 0]
                        }
                    },
                    monthsTotal: {
                        $sum: "$amount"
                    },
                }
            },
            {
                $sort: {
                    months: -1
                }
            },
            {
                $group: {
                    _id: "$_id.field1",
                    days: {
                        $sum: "$days"
                    },
                    weeks: {
                        $sum: "$weeks"
                    },
                    months: {
                        $sum: "$months"
                    },
                    daysTotal: {
                        $sum: "$daysTotal"
                    },
                    weeksTotal: {
                        $sum: "$weeksTotal"
                    },
                    monthsTotal: {
                        $sum: "$monthsTotal"
                    },

                    field2Aggregates: {
                        $push: {
                            _id: "$_id.field2",

                            days: "$days",
                            weeks: "$weeks",
                            months: "$months",
                            daysTotal: "$daysTotal",
                            weeksTotal: "$weeksTotal",
                            monthsTotal: "$monthsTotal"
                        }
                    }
                }
            },
            {
                $sort: {
                    months: -1
                }
            }
        ], {
            clientCollection: 'bills-spreadsheet'
        });
});
